package xyz.outlinr.api.dto.request;

import xyz.outlinr.api.entity.enumeration.ConfirmationMethod;
import xyz.outlinr.api.entity.enumeration.DeliveryType;
import xyz.outlinr.api.entity.enumeration.ParticipationMode;
import xyz.outlinr.api.entity.enumeration.ShippingResponsibility;

import java.math.BigDecimal;

public record CreateEscrowRequest(
        ParticipationMode participationMode,

        // For SELF_AS_BUYER / SELF_AS_SELLER
        String counterpartyEmail,
        String counterpartyName,

        // For AGENT mode
        String buyerEmail,
        String buyerName,
        String sellerEmail,
        String sellerName,

        String title,
        String description,
        BigDecimal amount,
        String currency,
        DeliveryType deliveryType,

        // Advanced — defaults applied if null
        Integer inspectionPeriodDays,
        Boolean autoRelease,
        Integer disputeWindowHours,
        Boolean requireProofOfDelivery,
        Boolean milestoneEnabled,
        String customDeliveryNotes,

        // Physical-specific
        ShippingResponsibility shippingResponsibility,
        Integer expectedDeliveryDays,

        // Service-specific
        ConfirmationMethod confirmationMethod) {
}
