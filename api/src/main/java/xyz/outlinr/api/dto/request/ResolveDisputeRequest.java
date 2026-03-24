package xyz.outlinr.api.dto.request;

import jakarta.validation.constraints.NotNull;
import xyz.outlinr.api.entity.enumeration.DisputeResolution;

public record ResolveDisputeRequest(
        @NotNull(message = "Resolution is required")
        DisputeResolution resolution,
        
        String adminNotes
) {}
