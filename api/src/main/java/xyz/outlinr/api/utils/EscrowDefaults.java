package xyz.outlinr.api.utils;

public final class EscrowDefaults {

    private EscrowDefaults() {
    }

    public static final String DEFAULT_CURRENCY = "NGN";
    public static final int INSPECTION_PERIOD_DAYS = 3;
    public static final boolean AUTO_RELEASE = true;
    public static final int DISPUTE_WINDOW_HOURS = 48;
    public static final boolean REQUIRE_PROOF_OF_DELIVERY = true;
    public static final boolean MILESTONE_ENABLED = false;
    public static final double AMOUNT_MIN = 100;
    public static final double AMOUNT_MAX = 20_000_000;
    public static final double FEE_PERCENT = 1.5;
}
