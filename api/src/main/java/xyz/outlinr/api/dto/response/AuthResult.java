package xyz.outlinr.api.dto.response;

public record AuthResult(
        String accessToken,
        String refreshToken,
        AuthResponse response) {
}
