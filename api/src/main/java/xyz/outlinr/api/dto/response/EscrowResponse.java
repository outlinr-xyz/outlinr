package xyz.outlinr.api.dto.response;

import xyz.outlinr.api.entity.enumeration.ConfirmationMethod;
import xyz.outlinr.api.entity.enumeration.DeliveryType;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;
import xyz.outlinr.api.entity.enumeration.ParticipationMode;
import xyz.outlinr.api.entity.enumeration.ShippingResponsibility;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EscrowResponse(
        UUID id,
        String title,
        String description,
        BigDecimal amount,
        String currency,
        EscrowStatus status,
        ParticipationMode participationMode,
        DeliveryType deliveryType,
        Integer inspectionPeriodDays,
        Boolean autoRelease,
        Integer disputeWindowHours,
        Boolean requireProofOfDelivery,
        Boolean milestoneEnabled,
        String customDeliveryNotes,
        ShippingResponsibility shippingResponsibility,
        Integer expectedDeliveryDays,
        ConfirmationMethod confirmationMethod,
        String deliveryEvidence,
        Instant createdAt,
        Instant updatedAt,
        String createdByName,
        String createdByEmail,
        List<EscrowParticipantResponse> participants) {
}
