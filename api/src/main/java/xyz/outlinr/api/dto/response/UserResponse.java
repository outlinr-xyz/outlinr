package xyz.outlinr.api.dto.response;

import xyz.outlinr.api.entity.User;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String accountType,
        String accountStatus,
        String userTier,
        boolean identityVerified,
        boolean hasBankAccount,
        String bankAccountNumberMasked,
        String bankCode,
        String bankName) {

    public static UserResponse from(User user) {
        String rawAcct = user.getBankAccountNumber();
        String masked = (rawAcct != null && rawAcct.length() >= 4)
                ? "****" + rawAcct.substring(rawAcct.length() - 4)
                : null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAccountType().name().toLowerCase(),
                user.getAccountStatus().name(),
                user.getUserTier().name(),
                user.isIdentityVerified(),
                rawAcct != null && !rawAcct.isBlank(),
                masked,
                user.getBankCode(),
                user.getBankName());
    }
}
