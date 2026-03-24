// Shared escrow default constants — mirrors backend EscrowDefaults.java
export const ESCROW_DEFAULTS = {
    CURRENCY: "NGN",
    INSPECTION_PERIOD_DAYS: 3,
    AUTO_RELEASE: true,
    DISPUTE_WINDOW_HOURS: 48,
    REQUIRE_PROOF_OF_DELIVERY: true,
    MILESTONE_ENABLED: false,
    AMOUNT_MIN: 100,
    AMOUNT_MAX: 20_000_000,
    FEE_PERCENT: 1.5,
} as const;
