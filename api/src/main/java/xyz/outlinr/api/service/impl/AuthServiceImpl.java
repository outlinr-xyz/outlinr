package xyz.outlinr.api.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import xyz.outlinr.api.dto.request.*;
import xyz.outlinr.api.dto.response.*;
import xyz.outlinr.api.entity.enumeration.AccountStatus;
import xyz.outlinr.api.entity.enumeration.UserTier;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.exception.InvalidCredentialsException;
import xyz.outlinr.api.exception.InvalidTokenException;
import xyz.outlinr.api.exception.UserAlreadyExistsException;
import xyz.outlinr.api.repository.UserRepository;
import xyz.outlinr.api.security.JwtService;
import xyz.outlinr.api.service.AuthService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already in use");
        }

        User.AccountType accountType;
        try {
            accountType = User.AccountType.valueOf(
                    request.accountType() != null ? request.accountType().toUpperCase() : "INDIVIDUAL");
        } catch (IllegalArgumentException e) {
            accountType = User.AccountType.INDIVIDUAL;
        }

        var user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .accountType(accountType)
                .userTier(UserTier.FULL)
                .build();

        user = userRepository.save(user);

        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResult(
                accessToken,
                refreshToken,
                new AuthResponse("Registration successful", UserResponse.from(user), null));
    }

    @Override
    public AuthResult login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("User not found after authentication"));

        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResult(
                accessToken,
                refreshToken,
                new AuthResponse("Login successful", UserResponse.from(user), null));
    }

    @Override
    public AuthResult refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new InvalidTokenException("Refresh token not found");
        }

        String email;
        try {
            email = jwtService.extractEmail(refreshToken);
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        var newAccessToken = jwtService.generateAccessToken(user);

        // Keep the same refresh token, just return a new access token
        return new AuthResult(
                newAccessToken,
                null,
                new AuthResponse("Token refreshed", UserResponse.from(user), null));
    }

    @Override
    public UserResponse getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new InvalidTokenException("Not authenticated");
        }

        var user = (User) authentication.getPrincipal();
        return UserResponse.from(user);
    }

    @Override
    public AuthResult completeAccountSetup(AccountSetupRequest request, User currentUser) {
        // Validate user is in PENDING_SETUP
        if (currentUser.getAccountStatus() != AccountStatus.PENDING_SETUP) {
            throw new IllegalStateException("Account setup is already complete");
        }

        currentUser.setName(request.name());
        currentUser.setPassword(passwordEncoder.encode(request.password()));
        
        try {
            currentUser.setAccountType(User.AccountType.valueOf(
                    request.accountType() != null ? request.accountType().toUpperCase() : "INDIVIDUAL"));
        } catch (IllegalArgumentException e) {
            currentUser.setAccountType(User.AccountType.INDIVIDUAL);
        }

        currentUser.setAccountStatus(AccountStatus.ACTIVE);
        User saved = userRepository.save(currentUser);

        var accessToken = jwtService.generateAccessToken(saved);
        var refreshToken = jwtService.generateRefreshToken(saved);

        return new AuthResult(
                accessToken,
                refreshToken,
                new AuthResponse("Account setup completed successfully", UserResponse.from(saved), null));
    }

    @Override
    public UserResponse updateBankAccount(UpdateBankAccountRequest request, User currentUser) {
        currentUser.setBankAccountNumber(request.accountNumber());
        currentUser.setBankCode(request.bankCode());
        currentUser.setBankName(request.bankName());
        User saved = userRepository.save(currentUser);
        return UserResponse.from(saved);
    }
}
