package xyz.outlinr.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateDisputeRequest(
        @NotBlank(message = "Reason is required")
        String reason
) {}
