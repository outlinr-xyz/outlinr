package xyz.outlinr.api.service.impl;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.outlinr.api.dto.request.*;
import xyz.outlinr.api.dto.response.*;
import xyz.outlinr.api.entity.*;
import xyz.outlinr.api.entity.enumeration.*;
import xyz.outlinr.api.exception.IllegalStateTransitionException;
import xyz.outlinr.api.repository.EscrowParticipantRepository;
import xyz.outlinr.api.repository.EscrowRepository;
import xyz.outlinr.api.repository.FinancialLedgerRepository;
import xyz.outlinr.api.repository.PayoutTransactionRepository;
import xyz.outlinr.api.repository.UserRepository;
import xyz.outlinr.api.service.EscrowService;
import xyz.outlinr.api.service.TransferService;
import xyz.outlinr.api.service.EmailService;
import xyz.outlinr.api.security.JwtService;

import java.time.Instant;
import java.util.*;

@lombok.extern.slf4j.Slf4j
@Service
@Transactional
public class EscrowServiceImpl implements EscrowService {

    private final EscrowRepository escrowRepository;
    private final EscrowParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final PayoutTransactionRepository payoutRepository;
    private final FinancialLedgerRepository ledgerRepository;
    private final TransferService transferService;
    private final EmailService emailService; // Changed to use imported EmailService
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public EscrowServiceImpl(
            EscrowRepository escrowRepository,
            EscrowParticipantRepository participantRepository,
            UserRepository userRepository,
            PayoutTransactionRepository payoutRepository,
            FinancialLedgerRepository ledgerRepository,
            TransferService transferService,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.escrowRepository = escrowRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.payoutRepository = payoutRepository;
        this.ledgerRepository = ledgerRepository;
        this.transferService = transferService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ── Allowed status transitions ──
    private static final Map<EscrowStatus, Set<EscrowStatus>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry(EscrowStatus.DRAFT, Set.of(EscrowStatus.PENDING_INVITE, EscrowStatus.AWAITING_FUNDING)),
            Map.entry(EscrowStatus.PENDING_INVITE, Set.of(EscrowStatus.AWAITING_FUNDING, EscrowStatus.CANCELLED)),
            Map.entry(EscrowStatus.AWAITING_FUNDING, Set.of(EscrowStatus.FUNDED, EscrowStatus.PENDING_ACCEPTANCE, EscrowStatus.CANCELLED)),
            Map.entry(EscrowStatus.PENDING_ACCEPTANCE, Set.of(EscrowStatus.ACTIVE, EscrowStatus.CANCELLED)),
            Map.entry(EscrowStatus.ACTIVE, Set.of(EscrowStatus.DELIVERY_IN_PROGRESS, EscrowStatus.DELIVERED)),
            Map.entry(EscrowStatus.FUNDED, Set.of(EscrowStatus.DELIVERY_IN_PROGRESS, EscrowStatus.PENDING_ACCEPTANCE)),
            Map.entry(EscrowStatus.DELIVERY_IN_PROGRESS, Set.of(EscrowStatus.DELIVERED)),
            Map.entry(EscrowStatus.DELIVERED, Set.of(EscrowStatus.INSPECTION)),
            Map.entry(EscrowStatus.INSPECTION, Set.of(EscrowStatus.COMPLETED, EscrowStatus.DISPUTED)),
            Map.entry(EscrowStatus.DISPUTED, Set.of(EscrowStatus.RESOLVED, EscrowStatus.CANCELLED)),
            Map.entry(EscrowStatus.RESOLVED, Set.of(EscrowStatus.COMPLETED, EscrowStatus.REFUNDED)));

    @Override
    public EscrowResponse createAndFundEscrow(CreateEscrowRequest request, User creator, String txnRef, long amountInKobo) {
        assertAccountActive(creator);
        assertCanCreate(creator);
        // This method creates the escrow with an initial status of FUNDED
        // and records the payment history.
        EscrowResponse response = createEscrow(request, creator, EscrowStatus.FUNDED);
        
        // Add specific history for the payment
        Escrow escrow = escrowRepository.findById(response.id()).orElseThrow();
        EscrowStatusHistory paymentHistory = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(null)
                .toStatus(EscrowStatus.FUNDED)
                .changedBy(creator)
                .reason("Escrow created and funded (Txn: " + txnRef + ")")
                .build();
        escrow.getStatusHistory().add(paymentHistory);
        escrowRepository.save(escrow);

        // CREATE LEDGER ENTRY — FUNDS HELD
        FinancialLedger ledger = FinancialLedger.builder()
                .escrow(escrow)
                .amount(escrow.getAmount())
                .currency(escrow.getCurrency())
                .status(LedgerStatus.HELD)
                .paymentReference(txnRef)
                .build();
        ledgerRepository.save(ledger);
        
        // Send role-aware invite emails: creator gets confirmation, non-creators get invite links
        emailService.sendEscrowInviteEmails(escrow, creator);

        return toResponse(escrow);
    }

    private EscrowResponse createEscrow(CreateEscrowRequest request, User creator, EscrowStatus forcedStatus) {
        // Validate amount bounds
        java.math.BigDecimal minAmount = java.math.BigDecimal.valueOf(xyz.outlinr.api.utils.EscrowDefaults.AMOUNT_MIN);
        java.math.BigDecimal maxAmount = java.math.BigDecimal.valueOf(xyz.outlinr.api.utils.EscrowDefaults.AMOUNT_MAX);
        if (request.amount().compareTo(minAmount) < 0 || request.amount().compareTo(maxAmount) > 0) {
            throw new IllegalArgumentException(
                    "Amount must be between " + xyz.outlinr.api.utils.EscrowDefaults.AMOUNT_MIN + " and " + xyz.outlinr.api.utils.EscrowDefaults.AMOUNT_MAX);
        }

        // Validate counterparty is not creator
        if (request.participationMode() == ParticipationMode.AGENT) {
            if (request.buyerEmail().equalsIgnoreCase(creator.getEmail()) || request.sellerEmail().equalsIgnoreCase(creator.getEmail())) {
                throw new IllegalArgumentException("Agent cannot be a buyer or seller in the same escrow");
            }
            if (request.buyerEmail().equalsIgnoreCase(request.sellerEmail())) {
                throw new IllegalArgumentException("Buyer and Seller emails must be different");
            }
        } else if (request.counterpartyEmail().equalsIgnoreCase(creator.getEmail())) {
            throw new IllegalArgumentException("You cannot set yourself as the counterparty");
        }

        Escrow escrow = Escrow.builder()
                .title(request.title())
                .description(request.description())
                .amount(request.amount())
                .currency(request.currency() != null ? request.currency() : xyz.outlinr.api.utils.EscrowDefaults.DEFAULT_CURRENCY)
                .participationMode(request.participationMode())
                .deliveryType(request.deliveryType())
                .inspectionPeriodDays(request.inspectionPeriodDays() != null ? request.inspectionPeriodDays()
                        : xyz.outlinr.api.utils.EscrowDefaults.INSPECTION_PERIOD_DAYS)
                .autoRelease(request.autoRelease() != null ? request.autoRelease() : xyz.outlinr.api.utils.EscrowDefaults.AUTO_RELEASE)
                .disputeWindowHours(request.disputeWindowHours() != null ? request.disputeWindowHours()
                        : xyz.outlinr.api.utils.EscrowDefaults.DISPUTE_WINDOW_HOURS)
                .requireProofOfDelivery(request.requireProofOfDelivery() != null ? request.requireProofOfDelivery()
                        : xyz.outlinr.api.utils.EscrowDefaults.REQUIRE_PROOF_OF_DELIVERY)
                .milestoneEnabled(request.milestoneEnabled() != null ? request.milestoneEnabled()
                        : xyz.outlinr.api.utils.EscrowDefaults.MILESTONE_ENABLED)
                .customDeliveryNotes(request.customDeliveryNotes())
                .shippingResponsibility(request.shippingResponsibility())
                .expectedDeliveryDays(request.expectedDeliveryDays())
                .confirmationMethod(request.confirmationMethod())
                .createdBy(creator)
                .build();

        // Determine initial status
        EscrowStatus initialStatus = forcedStatus;
        if (initialStatus == null) {
            if (request.participationMode() == ParticipationMode.SELF_AS_BUYER) {
                initialStatus = EscrowStatus.AWAITING_FUNDING;
            } else if (request.participationMode() == ParticipationMode.SELF_AS_SELLER) {
                initialStatus = EscrowStatus.AWAITING_FUNDING;
            } else {
                initialStatus = EscrowStatus.AWAITING_FUNDING;
            }
        }
        escrow.setStatus(initialStatus);

        // Create participants
        List<EscrowParticipant> participants = new ArrayList<>();

        switch (request.participationMode()) {
            case SELF_AS_BUYER -> {
                // Creator is buyer
                EscrowParticipant buyerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(creator)
                        .email(creator.getEmail())
                        .name(creator.getName())
                        .role(ParticipantRole.BUYER)
                        .inviteAccepted(true)
                        .inviteAcceptedAt(java.time.Instant.now())
                        .build();
                participants.add(buyerParticipant);

                // Counterparty is seller (invited)
                User existingSeller = userRepository.findByEmail(request.counterpartyEmail()).orElse(null);
                EscrowParticipant sellerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(existingSeller)
                        .email(request.counterpartyEmail())
                        .name(request.counterpartyName())
                        .role(ParticipantRole.SELLER)
                        .build();
                participants.add(sellerParticipant);
            }
            case SELF_AS_SELLER -> {
                // Creator is seller
                EscrowParticipant sellerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(creator)
                        .email(creator.getEmail())
                        .name(creator.getName())
                        .role(ParticipantRole.SELLER)
                        .inviteAccepted(true)
                        .inviteAcceptedAt(java.time.Instant.now())
                        .build();
                participants.add(sellerParticipant);

                // Counterparty is buyer (invited)
                User existingBuyer = userRepository.findByEmail(request.counterpartyEmail()).orElse(null);
                EscrowParticipant buyerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(existingBuyer)
                        .email(request.counterpartyEmail())
                        .name(request.counterpartyName())
                        .role(ParticipantRole.BUYER)
                        .build();
                participants.add(buyerParticipant);
            }
            case AGENT -> {
                // Creator is agent
                EscrowParticipant agentParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(creator)
                        .email(creator.getEmail())
                        .name(creator.getName())
                        .role(ParticipantRole.AGENT)
                        .inviteAccepted(true)
                        .inviteAcceptedAt(java.time.Instant.now())
                        .build();
                participants.add(agentParticipant);

                // Buyer (invited)
                User existingBuyer = userRepository.findByEmail(request.buyerEmail()).orElse(null);
                EscrowParticipant buyerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(existingBuyer)
                        .email(request.buyerEmail())
                        .name(request.buyerName())
                        .role(ParticipantRole.BUYER)
                        .build();
                participants.add(buyerParticipant);

                // Seller (invited)
                User existingSeller = userRepository.findByEmail(request.sellerEmail()).orElse(null);
                EscrowParticipant sellerParticipant = EscrowParticipant.builder()
                        .escrow(escrow)
                        .user(existingSeller)
                        .email(request.sellerEmail())
                        .name(request.sellerName())
                        .role(ParticipantRole.SELLER)
                        .build();
                participants.add(sellerParticipant);
            }
        }

        escrow.setParticipants(participants);

        // Log initial status
        EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(null)
                .toStatus(initialStatus)
                .changedBy(creator)
                .reason("Escrow created")
                .build();
        escrow.getStatusHistory().add(history);

        Escrow saved = escrowRepository.save(escrow);

        // Send invite emails immediately after creation for the unfunded path.
        // Creator gets a confirmation; all uninvited participants get a magic-link invite.
        // This ensures seller-created escrows notify the buyer, and agent-created escrows
        // notify both buyer and seller — regardless of whether the escrow is funded yet.
        if (forcedStatus == EscrowStatus.AWAITING_FUNDING) {
            // Capture the creator reference for the lambda/method call
            final User creatorRef = creator;
            // Detach from the current transaction context before handing off to @Async
            emailService.sendEscrowInviteEmails(saved, creatorRef);
        }

        return toResponse(saved);
    }


    @Override
    public EscrowResponse createEscrow(CreateEscrowRequest request, User creator) {
        assertAccountActive(creator);
        assertCanCreate(creator);
        return createEscrow(request, creator, EscrowStatus.AWAITING_FUNDING);
    }

    @Override
    @Transactional(readOnly = true)
    public EscrowResponse getEscrow(UUID id, User currentUser) {
        Escrow escrow = escrowRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + id));

        assertParticipant(escrow, currentUser);
        return toResponse(escrow);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EscrowResponse> listEscrows(User currentUser, EscrowStatus statusFilter) {
        List<Escrow> escrows;
        if (statusFilter != null) {
            escrows = escrowRepository.findByParticipantUserAndStatus(currentUser, statusFilter);
        } else {
            escrows = escrowRepository.findByParticipantUser(currentUser);
        }
        return escrows.stream().map(this::toResponse).toList();
    }

    @Override
    public EscrowResponse transitionStatus(UUID id, StatusTransitionRequest request, User currentUser) {
        assertAccountActive(currentUser);
        Escrow escrow = escrowRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + id));

        assertParticipant(escrow, currentUser);
        assertAccountActive(currentUser);
        validateTransition(escrow.getStatus(), request.toStatus());

        EscrowStatus fromStatus = escrow.getStatus();
        escrow.setStatus(request.toStatus());

        EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(fromStatus)
                .toStatus(request.toStatus())
                .changedBy(currentUser)
                .reason(request.reason())
                .build();
        escrow.getStatusHistory().add(history);

        Escrow saved = escrowRepository.save(escrow);

        // If transitioning to COMPLETED (Buyer confirmed delivery), payout the Seller
        if (request.toStatus() == EscrowStatus.COMPLETED) {
            // Check Ledger custody before triggering payout
            FinancialLedger ledger = ledgerRepository.findByEscrow(saved)
                    .orElseThrow(() -> new IllegalStateException("No ledger entry found for funded escrow. Cannot process payout."));
            
            if (ledger.getStatus() != LedgerStatus.HELD) {
                throw new IllegalStateException("Funds are not in HELD state. Current status: " + ledger.getStatus());
            }

            ledger.setStatus(LedgerStatus.PENDING_PAYOUT);
            ledgerRepository.save(ledger);

            triggerPayout(saved, ledger);
        } else if (request.toStatus() == EscrowStatus.REFUNDED) {
            // Check Ledger custody before refund
            FinancialLedger ledger = ledgerRepository.findByEscrow(saved)
                    .orElseThrow(() -> new IllegalStateException("No ledger entry found for funded escrow. Cannot process refund."));
            
            if (ledger.getStatus() != LedgerStatus.HELD && ledger.getStatus() != LedgerStatus.PENDING_PAYOUT) {
                throw new IllegalStateException("Funds cannot be refunded in their current state: " + ledger.getStatus());
            }

            ledger.setStatus(LedgerStatus.REFUNDED);
            ledgerRepository.save(ledger);
            
            // In a real system, we'd trigger a refund API call here.
            log.info("Logical refund completed for escrow {}", saved.getId());
        }

        return toResponse(saved);
    }

    @Override
    public AuthResult acceptInvite(InviteAcceptRequest request) {
        EscrowParticipant participant = participantRepository.findByInviteToken(request.inviteToken())
                .orElseThrow(() -> new NoSuchElementException("Invalid invite token"));

        // MAGIC LINK BEHAVIOR: 
        // 1. Resolve or create the user
        User user = userRepository.findByEmail(participant.getEmail()).orElseGet(() -> {
            User newUser = User.builder()
                .email(participant.getEmail())
                .name(participant.getName() != null ? participant.getName() : "Invited User")
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random temporary password
                .accountStatus(AccountStatus.PENDING_SETUP)
                .userTier(UserTier.PARTIAL) // Invite-created ghost accounts are PARTIAL
                .build();
            return userRepository.save(newUser);
        });

        participant.setInviteAccepted(true);
        participant.setInviteAcceptedAt(Instant.now());
        participant.setUser(user);
        participantRepository.save(participant);

        Escrow escrow = participant.getEscrow();

        // If the invited party accepts the invite, transition to ACTIVE
        if (escrow.getStatus() == EscrowStatus.PENDING_ACCEPTANCE) {
            EscrowStatus fromStatus = escrow.getStatus();
            escrow.setStatus(EscrowStatus.ACTIVE);

            EscrowStatusHistory history = EscrowStatusHistory.builder()
                    .escrow(escrow)
                    .fromStatus(fromStatus)
                    .toStatus(EscrowStatus.ACTIVE)
                    .changedBy(user) // Log with the authenticated user
                    .reason("Invite accepted by " + user.getName())
                    .build();
            escrow.getStatusHistory().add(history);
            escrowRepository.save(escrow);
        }

        // 2. Generate Authentication Result (Magic Link effect)
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResult(
                accessToken,
                refreshToken,
                new AuthResponse("Invitation accepted successfully", UserResponse.from(user), escrow.getId())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public InvitePreviewResponse getInvitePreview(UUID inviteToken) {
        EscrowParticipant participant = participantRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new NoSuchElementException("Invalid invite token"));

        Escrow escrow = participant.getEscrow();
        return new InvitePreviewResponse(
                escrow.getTitle(),
                escrow.getDescription(),
                escrow.getAmount(),
                escrow.getCurrency(),
                escrow.getDeliveryType(),
                escrow.getCreatedBy().getName(),
                participant.getRole());
    }


    @Override
    public void deleteEscrow(UUID id, DeleteEscrowRequest request, User currentUser) {
        assertAccountActive(currentUser);
        if (request.password() == null || !passwordEncoder.matches(request.password(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }

        Escrow escrow = escrowRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + id));

        // Only the creator may delete
        if (!escrow.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new SecurityException("Only the escrow creator can delete it");
        }


        EscrowStatus fromStatus = escrow.getStatus();
        if (fromStatus == EscrowStatus.DELETED) {
            return; // Already deleted
        }

        escrow.setStatus(EscrowStatus.DELETED);

        EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(fromStatus)
                .toStatus(EscrowStatus.DELETED)
                .changedBy(currentUser)
                .reason("Escrow deleted by user")
                .build();
        escrow.getStatusHistory().add(history);

        escrowRepository.save(escrow);
    }

    // ── Helpers ──

    private void triggerPayout(Escrow escrow, FinancialLedger ledger) {
        // Find the seller participant
        EscrowParticipant sellerParticipant = escrow.getParticipants().stream()
                .filter(p -> p.getRole() == ParticipantRole.SELLER)
                .findFirst()
                .orElse(null);

        if (sellerParticipant == null || sellerParticipant.getUser() == null) {
            ledger.setStatus(LedgerStatus.FAILED);
            ledgerRepository.save(ledger);
            throw new IllegalStateException("Cannot process payout: Seller is not fully registered or missing.");
        }

        User seller = sellerParticipant.getUser();
        String accountNumber = seller.getBankAccountNumber();
        String bankCode = seller.getBankCode();

        if (accountNumber == null || bankCode == null || accountNumber.isEmpty() || bankCode.isEmpty()) {
            ledger.setStatus(LedgerStatus.FAILED);
            ledgerRepository.save(ledger);
            throw new IllegalStateException("Cannot process payout: Seller bank details are missing.");
        }

        log.info("Triggering payout for seller: {}", seller.getEmail());
        
        String txnRef = "PO-" + escrow.getId().toString().substring(0, 8) + "-" + System.currentTimeMillis();
        ledger.setPayoutReference(txnRef);

        PayoutTransaction transaction = PayoutTransaction.builder()
                .escrow(escrow)
                .recipient(seller)
                .amount(escrow.getAmount())
                .currency(escrow.getCurrency())
                .bankAccountNumber(accountNumber)
                .bankCode(bankCode)
                .transactionReference(txnRef)
                .status(PayoutStatus.PENDING)
                .build();
        
        transaction = payoutRepository.save(transaction);

        try {
            boolean success = transferService.initiateTransfer(
                escrow.getAmount(),
                "Escrow Payout for: " + escrow.getTitle(),
                accountNumber,
                bankCode,
                txnRef
            );

            if (success) {
                transaction.setStatus(PayoutStatus.SUCCESSFUL);
                ledger.setStatus(LedgerStatus.RELEASED);
            } else {
                transaction.setStatus(PayoutStatus.FAILED);
                transaction.setInterswitchResponseCode("API_REJECTED");
                ledger.setStatus(LedgerStatus.FAILED);
            }
        } catch (Exception e) {
            log.error("Payout initiation failed", e);
            transaction.setStatus(PayoutStatus.FAILED);
            transaction.setInterswitchResponseCode("EXCEPTION_THROWN");
            ledger.setStatus(LedgerStatus.FAILED);
            payoutRepository.save(transaction);
            ledgerRepository.save(ledger);
            throw new RuntimeException("Payout failed: " + e.getMessage(), e);
        }
        
        payoutRepository.save(transaction);
        ledgerRepository.save(ledger);
    }

    private void validateTransition(EscrowStatus from, EscrowStatus to) {
        Set<EscrowStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new IllegalStateTransitionException(
                    "Cannot transition from " + from + " to " + to);
        }
    }

    private void assertParticipant(Escrow escrow, User user) {
        boolean isParticipant = escrow.getParticipants().stream()
                .anyMatch(p -> p.getUser() != null && p.getUser().getId().equals(user.getId()));
        if (!isParticipant) {
            throw new SecurityException("You are not a participant of this escrow");
        }
    }

    private void assertAccountActive(User user) {
        if (user.getAccountStatus() == AccountStatus.PENDING_SETUP) {
            throw new IllegalStateException("Please complete your account setup to perform this action.");
        }
    }

    private void assertCanCreate(User user) {
        if (user.getUserTier() == UserTier.PARTIAL) {
            throw new IllegalStateException("Partial accounts cannot create escrows. Please sign up for a full account.");
        }
        if (user.getUserTier() == UserTier.FULL && !user.isIdentityVerified()) {
            throw new IllegalStateException("KYC_REQUIRED");
        }
    }

    private EscrowResponse toResponse(Escrow escrow) {
        List<EscrowParticipantResponse> participants = escrow.getParticipants().stream()
                .map(p -> new EscrowParticipantResponse(
                        p.getId(),
                        p.getEmail(),
                        p.getName(),
                        p.getRole(),
                        p.getInviteAccepted(),
                        p.getInviteAcceptedAt()))
                .toList();

        return new EscrowResponse(
                escrow.getId(),
                escrow.getTitle(),
                escrow.getDescription(),
                escrow.getAmount(),
                escrow.getCurrency(),
                escrow.getStatus(),
                escrow.getParticipationMode(),
                escrow.getDeliveryType(),
                escrow.getInspectionPeriodDays(),
                escrow.getAutoRelease(),
                escrow.getDisputeWindowHours(),
                escrow.getRequireProofOfDelivery(),
                escrow.getMilestoneEnabled(),
                escrow.getCustomDeliveryNotes(),
                escrow.getShippingResponsibility(),
                escrow.getExpectedDeliveryDays(),
                escrow.getConfirmationMethod(),
                escrow.getDeliveryEvidence(),
                escrow.getCreatedAt(),
                escrow.getUpdatedAt(),
                escrow.getCreatedBy().getName(),
                escrow.getCreatedBy().getEmail(),
                participants);
    }
}
