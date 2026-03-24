package xyz.outlinr.api.dto.request;

import xyz.outlinr.api.entity.enumeration.EscrowStatus;

public record StatusTransitionRequest(
        EscrowStatus toStatus,
        String reason) {
}
