package xyz.outlinr.api.dto.response;

import xyz.outlinr.api.entity.enumeration.DisputeResolution;
import xyz.outlinr.api.entity.enumeration.DisputeStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DisputeResponse(
        UUID id,
        UUID escrowId,
        String raisedBy,
        String reason,
        DisputeStatus status,
        DisputeResolution resolution,
        String adminNotes,
        Instant deadline,
        Instant createdAt,
        Instant updatedAt,
        List<DisputeEvidenceResponse> evidence
) {}
