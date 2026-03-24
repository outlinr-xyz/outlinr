package xyz.outlinr.api.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import xyz.outlinr.api.config.InterswitchIdentityConfig;
import xyz.outlinr.api.dto.request.IdentityVerificationRequest;
import xyz.outlinr.api.dto.response.IdentityVerificationResponse;
import xyz.outlinr.api.entity.enumeration.KycType;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.repository.UserRepository;
import xyz.outlinr.api.service.IdentityVerificationService;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterswitchIdentityVerificationServiceImpl implements IdentityVerificationService {

    private final InterswitchIdentityConfig config;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Transactional
    public IdentityVerificationResponse verifyIdentity(IdentityVerificationRequest request, User currentUser) {
        if (currentUser.isIdentityVerified()) {
            return IdentityVerificationResponse.builder()
                    .verified(true)
                    .message("Identity is already verified.")
                    .build();
        }

        KycType kycType;
        try {
            kycType = KycType.valueOf(request.getKycType().toUpperCase());
        } catch (IllegalArgumentException e) {
            return IdentityVerificationResponse.builder()
                    .verified(false)
                    .message("Unsupported KYC Type: " + request.getKycType())
                    .build();
        }

        String kycId = request.getKycId();
        boolean isVerified = false;
        String message = "Verification failed";
        String matchScore = "0%";

        // 🛡️ Mock bypass for test values
        boolean bvnBypass = KycType.BVN.equals(kycType) && "22222222222".equals(kycId);
        boolean ninBypass = KycType.NIN.equals(kycType) && "12345678901".equals(kycId);
        boolean accountBypass = "1234567890".equals(request.getBankAccountNumber()) && "058".equals(request.getBankCode());

        if (bvnBypass || ninBypass || accountBypass) {
            log.info("Mock bypass triggered for identity verification: {} | {}", kycType, kycId);
            isVerified = true;
            message = "Verification successful (Test Mode)";
            matchScore = "100%";
            
            currentUser.setIdentityVerified(true);
            currentUser.setKycType(kycType);
            currentUser.setKycId(kycId);
            currentUser.setBankAccountNumber(request.getBankAccountNumber());
            currentUser.setBankCode(request.getBankCode());
            userRepository.save(currentUser);

            return IdentityVerificationResponse.builder()
                    .verified(isVerified)
                    .message(message)
                    .matchScore(matchScore)
                    .build();
        }

        try {
            log.info("Initiating {} verification for user {}", kycType, currentUser.getEmail());
            
            String accessToken = getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            String url = kycType == KycType.BVN ? config.getBvnUrl() : config.getNinUrl();
            
            // Sandbox payload structure
            Map<String, String> requestBody = Map.of(kycType.name().toLowerCase(), kycId);
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            org.springframework.core.ParameterizedTypeReference<Map<String, Object>> responseType = 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, requestEntity, responseType);
            Map<String, Object> body = response.getBody();
            
            log.info("Interswitch {} response: {}", kycType, body);

            // In sandbox, we look for responseCode "00" or status codes in the body
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                String responseCode = (String) body.getOrDefault("responseCode", "");
                if ("00".equals(responseCode) || body.containsKey("status") && body.get("status").toString().equalsIgnoreCase("SUCCESS")) {
                    isVerified = true;
                    message = kycType + " verification successful";
                    matchScore = "100%";
                    
                    currentUser.setIdentityVerified(true);
                    currentUser.setKycType(kycType);
                    currentUser.setKycId(kycId);
                    
                    // Also save bank details provided during KYC
                    currentUser.setBankAccountNumber(request.getBankAccountNumber());
                    currentUser.setBankCode(request.getBankCode());
                    
                    userRepository.save(currentUser);
                } else {
                    message = (String) body.getOrDefault("responseDescription", "Invalid " + kycType + " provided.");
                }
            } else {
                message = "Verification service returned error: " + response.getStatusCode();
            }
            
        } catch (Exception e) {
            log.error("Error calling Interswitch Identity API", e);
            message = "Error reaching verification service: " + e.getMessage();
        }

        return IdentityVerificationResponse.builder()
                .verified(isVerified)
                .message(message)
                .matchScore(matchScore)
                .build();
    }
    
    private String getAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            
            // 1 & 2. Manual Base64 encoding as requested (ClientId:ClientSecret)
            String auth = config.getClientId() + ":" + config.getClientSecret();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);
            
            // 3. Explicitly set content type and body
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
            String body = "grant_type=client_credentials";

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            
            log.info("Requesting Interswitch OAuth token from: {}", config.getOauthUrl());
            
            org.springframework.core.ParameterizedTypeReference<Map<String, Object>> responseType = 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    config.getOauthUrl(), 
                    org.springframework.http.HttpMethod.POST, 
                    request, 
                    responseType
            );
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("access_token")) {
                return (String) responseBody.get("access_token");
            }
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            log.error("Interswitch OAuth 401 Unauthorized: Final check on Client ID and Secret in .env");
            throw new RuntimeException("Interswitch Authentication Failed (401): Manual encoding check unsuccessful");
        } catch (Exception e) {
            log.error("Failed to get OAuth token from Interswitch", e);
            throw new RuntimeException("Could not obtain access token: " + e.getMessage());
        }
        throw new RuntimeException("Could not obtain access token from Interswitch — empty response");
    }

}
