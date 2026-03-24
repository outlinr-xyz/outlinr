package xyz.outlinr.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.outlinr.api.dto.request.CreateEscrowRequest;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.service.PaymentService;
import xyz.outlinr.api.dto.request.VerifyPaymentRequest;
import xyz.outlinr.api.dto.response.InitPaymentResponse;
import xyz.outlinr.api.dto.response.VerifyPaymentResponse;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/init/{escrowId}")
    public ResponseEntity<InitPaymentResponse> initPayment(@PathVariable UUID escrowId, @AuthenticationPrincipal User currentUser) {
        log.info("Initiating payment for escrow {}", escrowId);
        InitPaymentResponse payload = paymentService.initiatePayment(escrowId, currentUser);
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/init-new")
    public ResponseEntity<InitPaymentResponse> initNewEscrowPayment(
            @Valid @RequestBody CreateEscrowRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("Initiating payment for new escrow by {}", currentUser.getEmail());
        InitPaymentResponse payload = paymentService.initiateNewEscrowPayment(request, currentUser);
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/verify/{escrowId}")
    public ResponseEntity<VerifyPaymentResponse> verifyPayment(
            @PathVariable UUID escrowId,
            @Valid @RequestBody VerifyPaymentRequest request) {
        log.info("Verifying payment for escrow {} with txnRef {}", escrowId, request.getTxnRef());
        VerifyPaymentResponse response = paymentService.verifyEscrowPayment(
                escrowId,
                request.getTxnRef(),
                request.getAmount());
        if ("success".equalsIgnoreCase(response.getStatus())) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}
