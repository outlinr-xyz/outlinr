package xyz.outlinr.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateBankAccountRequest(
        @NotBlank @Size(min = 10, max = 10) @Pattern(regexp = "\\d{10}", message = "Account number must be exactly 10 digits")
        String accountNumber,

        @NotBlank @Size(min = 2, max = 10)
        String bankCode,

        @NotBlank @Size(max = 100)
        String bankName
) {}
