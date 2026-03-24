package xyz.outlinr.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VerifyAndCreateEscrowRequest(
    @NotBlank(message = "Transaction reference is required")
    String txnRef,

    @NotNull(message = "Amount is required")
    Long amount,

    @NotNull(message = "Escrow data is required")
    @Valid
    CreateEscrowRequest escrowData
) {}
