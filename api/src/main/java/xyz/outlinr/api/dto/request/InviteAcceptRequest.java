package xyz.outlinr.api.dto.request;

import java.util.UUID;

public record InviteAcceptRequest(
        UUID inviteToken) {
}
