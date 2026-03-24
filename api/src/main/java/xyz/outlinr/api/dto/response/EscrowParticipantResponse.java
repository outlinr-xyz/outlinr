package xyz.outlinr.api.dto.response;

import xyz.outlinr.api.entity.enumeration.ParticipantRole;

import java.time.Instant;
import java.util.UUID;

public record EscrowParticipantResponse(
        UUID id,
        String email,
        String name,
        ParticipantRole role,
        Boolean inviteAccepted,
        Instant inviteAcceptedAt) {
}
