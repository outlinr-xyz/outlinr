package xyz.outlinr.api.service;

import xyz.outlinr.api.dto.request.IdentityVerificationRequest;
import xyz.outlinr.api.dto.response.IdentityVerificationResponse;
import xyz.outlinr.api.entity.User;

public interface IdentityVerificationService {
    IdentityVerificationResponse verifyIdentity(IdentityVerificationRequest request, User currentUser);
}
