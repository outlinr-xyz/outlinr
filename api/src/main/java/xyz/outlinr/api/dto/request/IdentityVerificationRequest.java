package xyz.outlinr.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IdentityVerificationRequest {
    @NotBlank(message = "KYC Type is required (e.g., BVN, NIN)")
    private String kycType;
    
    @NotBlank(message = "KYC ID is required")
    @Size(min = 11, max = 11, message = "Identity number must be exactly 11 digits")
    @Pattern(regexp = "\\d{11}", message = "Identity number must only contain digits")
    private String kycId;

    @NotBlank(message = "Bank Account Number is required")
    @Size(min = 10, max = 10, message = "Account number must be exactly 10 digits")
    @Pattern(regexp = "\\d{10}", message = "Account number must only contain digits")
    private String bankAccountNumber;

    @NotBlank(message = "Bank Code is required")
    private String bankCode;
}
