package xyz.outlinr.api.entity.enumeration;

public enum LedgerStatus {
    HELD,            // Funds captured and held in settlement account
    PENDING_PAYOUT,  // Release triggered, payout initiation in progress
    RELEASED,        // Payout completed successfully
    REFUNDED,        // Refunded to buyer
    FAILED           // Payout or refund failed
}
