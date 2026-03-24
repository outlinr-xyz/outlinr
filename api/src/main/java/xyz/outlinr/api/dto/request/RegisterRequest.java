package xyz.outlinr.api.dto.request;

public record RegisterRequest(
        String name,
        String email,
        String password,
        String accountType) {
}
