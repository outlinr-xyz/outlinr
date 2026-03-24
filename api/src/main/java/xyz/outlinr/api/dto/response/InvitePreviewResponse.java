package xyz.outlinr.api.dto.response;

import xyz.outlinr.api.entity.enumeration.DeliveryType;
import xyz.outlinr.api.entity.enumeration.ParticipantRole;

import java.math.BigDecimal;

public record InvitePreviewResponse(
        String title,
        String description,
        BigDecimal amount,
        String currency,
        DeliveryType deliveryType,
        String createdByName,
        ParticipantRole invitedRole) {
}

