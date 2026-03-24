package xyz.outlinr.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import xyz.outlinr.api.dto.request.*;
import xyz.outlinr.api.dto.response.*;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.service.EscrowService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/escrows")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class EscrowController {

    private final EscrowService escrowService;

    @PostMapping
    public ResponseEntity<EscrowResponse> createEscrow(
            @Valid @RequestBody CreateEscrowRequest request,
            @AuthenticationPrincipal User currentUser) {
        EscrowResponse response = escrowService.createEscrow(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-and-create")
    public ResponseEntity<EscrowResponse> createAndFundEscrow(
            @Valid @RequestBody VerifyAndCreateEscrowRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("Atomic verify-and-create for user {}", currentUser.getEmail());
        EscrowResponse response = escrowService.createAndFundEscrow(request.escrowData(), currentUser, request.txnRef(), request.amount());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscrowResponse> getEscrow(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(escrowService.getEscrow(id, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<EscrowResponse>> listEscrows(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) EscrowStatus status) {
        return ResponseEntity.ok(escrowService.listEscrows(currentUser, status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EscrowResponse> transitionStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusTransitionRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(escrowService.transitionStatus(id, request, currentUser));
    }

    @PostMapping("/invite/accept")
    public ResponseEntity<AuthResult> acceptInvite(
            @Valid @RequestBody InviteAcceptRequest request) {
        return ResponseEntity.ok(escrowService.acceptInvite(request));
    }

    @GetMapping("/invite/preview")
    public ResponseEntity<InvitePreviewResponse> getInvitePreview(
            @RequestParam UUID token) {
        return ResponseEntity.ok(escrowService.getInvitePreview(token));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEscrow(
            @PathVariable UUID id,
            @Valid @RequestBody DeleteEscrowRequest request,
            @AuthenticationPrincipal User currentUser) {
        escrowService.deleteEscrow(id, request, currentUser);
        return ResponseEntity.noContent().build();
    }
}
