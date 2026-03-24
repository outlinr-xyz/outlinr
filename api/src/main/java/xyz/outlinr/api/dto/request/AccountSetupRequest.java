package xyz.outlinr.api.dto.request;

public record AccountSetupRequest(
    String password,
    String name,
    String accountType
) {}
