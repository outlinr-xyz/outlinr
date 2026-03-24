package xyz.outlinr.api.service;

import xyz.outlinr.api.dto.response.AuthResult;
import xyz.outlinr.api.dto.request.LoginRequest;
import xyz.outlinr.api.dto.request.RegisterRequest;
import xyz.outlinr.api.dto.request.AccountSetupRequest;
import xyz.outlinr.api.dto.request.UpdateBankAccountRequest;
import xyz.outlinr.api.dto.response.UserResponse;
import xyz.outlinr.api.entity.User;

public interface AuthService {
    AuthResult register(RegisterRequest request);

    AuthResult login(LoginRequest request);

    AuthResult refresh(String refreshToken);

    UserResponse getCurrentUser();

    AuthResult completeAccountSetup(AccountSetupRequest request, User currentUser);

    UserResponse updateBankAccount(UpdateBankAccountRequest request, User currentUser);
}

