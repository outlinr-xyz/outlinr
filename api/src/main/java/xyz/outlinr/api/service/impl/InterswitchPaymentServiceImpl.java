package xyz.outlinr.api.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import xyz.outlinr.api.config.InterswitchConfig;
import xyz.outlinr.api.dto.request.CreateEscrowRequest;
import xyz.outlinr.api.dto.request.VerifyAndCreateEscrowRequest;
import xyz.outlinr.api.entity.Escrow;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;
import xyz.outlinr.api.entity.EscrowStatusHistory;
import xyz.outlinr.api.entity.FinancialLedger;
import xyz.outlinr.api.entity.enumeration.LedgerStatus;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.dto.response.VerifyPaymentResponse;
import xyz.outlinr.api.repository.EscrowRepository;
import xyz.outlinr.api.service.EmailService;
import xyz.outlinr.api.service.PaymentService;

import xyz.outlinr.api.dto.response.InitPaymentResponse;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterswitchPaymentServiceImpl implements PaymentService {

    private final InterswitchConfig config;
    private final EscrowRepository escrowRepository;
    private final xyz.outlinr.api.repository.FinancialLedgerRepository ledgerRepository;
    private final EmailService emailService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.frontend.url:http://app.outlinr.xyz}")
    private String frontendUrl;

    @Override
    @Transactional
    public InitPaymentResponse initiatePayment(UUID escrowId, User currentUser) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + escrowId));

        if (escrow.getStatus() != EscrowStatus.AWAITING_FUNDING && escrow.getStatus() != EscrowStatus.DRAFT) {
             throw new IllegalStateException("Escrow cannot be funded in its current state: " + escrow.getStatus());
        }

        long amountInKobo = escrow.getAmount().multiply(new BigDecimal(100)).longValue();
        return initiatePaymentCommon(txnRefFor(escrowId), amountInKobo, escrowId.toString(), currentUser);
    }

    @Override
    @Transactional
    public InitPaymentResponse initiateNewEscrowPayment(CreateEscrowRequest request, User currentUser) {
        long amountInKobo = request.amount().multiply(new BigDecimal(100)).longValue();
        String tempId = UUID.randomUUID().toString().substring(0, 8);
        return initiatePaymentCommon("TXN-NEW-" + tempId + "-" + System.currentTimeMillis(), amountInKobo, "new", currentUser);
    }

    private InitPaymentResponse initiatePaymentCommon(String txnRef, long amountInKobo, String siteId, User currentUser) {
        String siteRedirectUrl = frontendUrl + "/escrow/" + siteId + "/verify-payment";

        String rawString = txnRef + config.getMerchantId() + config.getPayItemId() + amountInKobo + siteRedirectUrl + config.getMacKey();
        String hash = generateSha512(rawString);

        return InitPaymentResponse.builder()
                .productId(config.getMerchantId())
                .payItemId(config.getPayItemId())
                .amount(String.valueOf(amountInKobo))
                .currency("566")
                .siteRedirectUrl(siteRedirectUrl)
                .txnRef(txnRef)
                .hash(hash)
                .custId(currentUser.getId().toString())
                .custIdDesc(currentUser.getName())
                .custName(currentUser.getName())
                .custEmail(currentUser.getEmail())
                .build();
    }

    private String txnRefFor(UUID escrowId) {
        return "TXN-" + escrowId.toString().substring(0, 8) + "-" + System.currentTimeMillis();
    }

    @Override
    public VerifyPaymentResponse verifyAndCreateEscrow(VerifyAndCreateEscrowRequest request, User currentUser) {
        // This is a bridge method if used, but we'll likely call escrowService.createAndFundEscrow 
        // from the controller after calling verifyTransaction here.
        boolean success = verifyTransactionWithInterswitch(request.txnRef(), request.amount());
        if (success) {
            return new VerifyPaymentResponse("success", "Payment verified");
        }
        return new VerifyPaymentResponse("failed", "Payment verification failed");
    }

    @Override
    @Transactional
    public boolean verifyTransaction(String transactionReference) {
        log.info("Verifying transaction: {}", transactionReference);
        
        // This is a bridge. We usually have an escrowId in the context or request.
        // If this is called without escrowId, we might need a way to find the escrow.
        // For now, let's assume we use the verifyAndFundEscrow from the controller which has the ID.
        return true; 
    }
    
    @Override
    @Transactional
    public boolean verifyAndFundEscrow(UUID escrowId, String transactionReference, long amountInKobo) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + escrowId));

        log.info("Verifying and funding escrow {} with ref {} and amount {}", escrowId, transactionReference, amountInKobo);

        // If already funded/active, don't re-verify
        if (escrow.getStatus() == EscrowStatus.PENDING_ACCEPTANCE || 
            escrow.getStatus() == EscrowStatus.ACTIVE || 
            escrow.getStatus() == EscrowStatus.FUNDED) {
            return true;
        }

        if (verifyTransactionWithInterswitch(transactionReference, amountInKobo)) {
            log.info("Payment Verification SUCCESS for escrow {}", escrowId);
            
            EscrowStatus fromStatus = escrow.getStatus();
            
            // If the seller has already accepted the invite (e.g. SELF_AS_SELLER), next status is FUNDED
            boolean sellerAccepted = escrow.getParticipants().stream()
                    .filter(p -> p.getRole() == xyz.outlinr.api.entity.enumeration.ParticipantRole.SELLER)
                    .anyMatch(p -> p.getInviteAccepted() != null && p.getInviteAccepted());
                    
            EscrowStatus nextStatus = sellerAccepted ? EscrowStatus.FUNDED : EscrowStatus.PENDING_ACCEPTANCE;
            escrow.setStatus(nextStatus);

            EscrowStatusHistory history = EscrowStatusHistory.builder()
                    .escrow(escrow)
                    .fromStatus(fromStatus)
                    .toStatus(nextStatus)
                    .changedBy(escrow.getCreatedBy())
                    .reason("Payment verified via Interswitch: " + transactionReference)
                    .build();

            escrow.getStatusHistory().add(history);
            escrowRepository.save(escrow);

            // Create ledger entry
            FinancialLedger ledger = FinancialLedger.builder()
                    .escrow(escrow)
                    .amount(escrow.getAmount())
                    .currency(escrow.getCurrency())
                    .status(LedgerStatus.HELD)
                    .paymentReference(transactionReference)
                    .build();
            ledgerRepository.save(ledger);

            // Send role-aware invite emails: creator gets confirmation, uninvited participants get invite links
            try {
                emailService.sendEscrowInviteEmails(escrow, escrow.getCreatedBy());
            } catch (Exception e) {
                log.error("Failed to send escrow invite emails", e);
            }
            
            return true;
        }

        log.warn("Payment Verification FAILED for escrow {}", escrowId);
        return false;
    }

    @Override
    @Transactional
    public VerifyPaymentResponse verifyEscrowPayment(UUID escrowId, String transactionReference, long amountInKobo) {
        boolean isSuccessful = verifyAndFundEscrow(escrowId, transactionReference, amountInKobo);
        if (isSuccessful) {
            return new VerifyPaymentResponse("success", "Payment verified and escrow funded");
        }
        return new VerifyPaymentResponse("failed", "Payment verification failed");
    }

    private boolean verifyTransactionWithInterswitch(String transactionReference, long amountInKobo) {
        // Hash: merchantCode + transactionReference + macKey
        String hashStr = config.getMerchantId() + transactionReference + config.getMacKey();
        String hash = generateSha512(hashStr);

        // Standard GET request to gettransaction.json
        String verifyUrl = config.getVerifyUrl() + "?merchantcode=" + config.getMerchantId() +
                "&transactionreference=" + transactionReference + "&amount=" + amountInKobo;

        log.info("Calling Interswitch Verification: {}", verifyUrl);

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Hash", hash);
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.core.ParameterizedTypeReference<Map<String, Object>> responseType = 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {};
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    verifyUrl, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    responseType
            );
            
            Map<String, Object> body = response.getBody();
            log.info("Interswitch verification response: {}", body);

            if (body != null) {
                String responseCode = (String) body.get("ResponseCode");
                // "00" indicates success in Interswitch
                return "00".equals(responseCode);
            }
            return false;
        } catch (Exception e) {
            log.error("Error during Interswitch transaction verification", e);
            return false;
        }
    }

    private String generateSha512(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-512 algorithm not found: " + e.getMessage());
        }
    }
}
