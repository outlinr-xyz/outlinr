package xyz.outlinr.api.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import xyz.outlinr.api.config.TransferConfig;
import xyz.outlinr.api.service.TransferService;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterswitchTransferServiceImpl implements TransferService {

    private final TransferConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders getAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String authString = config.getClientId() + ":" + config.getClientSecret();
        String base64Auth = Base64.getEncoder().encodeToString(authString.getBytes());
        headers.setBasicAuth(base64Auth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Override
    public boolean validateAccount(String accountNumber, String bankCode) {
        log.info("Validating account {} for bank {}", accountNumber, bankCode);
        
        try {
            HttpHeaders headers = getAuthHeaders();
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("accountNumber", accountNumber);
            requestBody.put("bankCode", bankCode);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                config.getNameEnquiryUrl(),
                HttpMethod.POST,
                request,
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            return response.getStatusCode() == HttpStatus.OK && response.getBody() != null;
        } catch (Exception e) {
            log.error("Failed to validate account", e);
            return false;
        }
    }

    @Override
    public boolean initiateTransfer(BigDecimal amount, String description, String toAccount, String bankCode, String txnRef) {
        log.info("Initiating transfer of {} to account {} at bank {}", amount, toAccount, bankCode);
        
        try {
            HttpHeaders headers = getAuthHeaders();
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("amount", amount.multiply(new BigDecimal(100)).toBigInteger().toString()); // In Kobo
            requestBody.put("description", description);
            requestBody.put("destinationAccount", toAccount);
            requestBody.put("destinationBankCode", bankCode);
            requestBody.put("transferCode", txnRef); // Unique reference

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                config.getTransferUrl(),
                HttpMethod.POST,
                request,
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.ACCEPTED) {
                log.info("Transfer initiated successfully. Ref: {}", txnRef);
                return true;
            } else {
                log.warn("Transfer initiation failed with status: {}, body: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to initiate transfer", e);
            return false;
        }
    }
}
