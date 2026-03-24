package xyz.outlinr.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record DisputeEvidenceResponse(
        UUID id,
        String uploadedBy,
        String fileUrl,
        String fileType,
        String originalFileName,
        Instant uploadedAt
) {}
