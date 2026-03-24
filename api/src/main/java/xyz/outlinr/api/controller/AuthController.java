package xyz.outlinr.api.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.outlinr.api.dto.request.*;
import xyz.outlinr.api.dto.response.*;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.security.CookieService;
import xyz.outlinr.api.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        var result = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(result.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createRefreshTokenCookie(result.refreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        var result = authService.login(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(result.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createRefreshTokenCookie(result.refreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        var tokenOpt = cookieService.extractCookie(request, CookieService.REFRESH_TOKEN_COOKIE);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Refresh token not found"));
        }

        var result = authService.refresh(tokenOpt.get());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(result.accessToken()).toString())
                .body(result.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.clearAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieService.clearRefreshTokenCookie().toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/complete-setup")
    public ResponseEntity<AuthResponse> completeSetup(
            @Valid @RequestBody AccountSetupRequest request,
            @AuthenticationPrincipal User user) {
        var result = authService.completeAccountSetup(request, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(result.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createRefreshTokenCookie(result.refreshToken()).toString())
                .body(result.response());
    }

    @PutMapping("/bank-account")
    public ResponseEntity<UserResponse> updateBankAccount(
            @Valid @RequestBody UpdateBankAccountRequest request,
            @AuthenticationPrincipal User user) {
        UserResponse updated = authService.updateBankAccount(request, user);
        return ResponseEntity.ok(updated);
    }
}

