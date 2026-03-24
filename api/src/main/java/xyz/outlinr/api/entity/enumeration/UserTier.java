package xyz.outlinr.api.entity.enumeration;

/**
 * Defines capability tiers for users on the platform.
 * <ul>
 *   <li>PARTIAL – invite-only, no account creation. Can accept/reject/monitor/dispute escrows.</li>
 *   <li>FULL    – standard signup. Can do everything PARTIAL can + create escrows (after KYC).</li>
 *   <li>AGENT   – fully signed up and agent-flagged. Can create escrows on behalf of buyer + seller.</li>
 * </ul>
 */
public enum UserTier {
    PARTIAL,
    FULL,
    AGENT
}
