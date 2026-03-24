package xyz.outlinr.api.dto.request;

public record LoginRequest(
        String email,
        String password) {
}
