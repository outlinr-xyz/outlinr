package xyz.outlinr.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.outlinr.api.dto.request.CreateDisputeRequest;
import xyz.outlinr.api.dto.request.ResolveDisputeRequest;
import xyz.outlinr.api.dto.response.DisputeEvidenceResponse;
import xyz.outlinr.api.dto.response.DisputeResponse;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.service.DisputeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;
    
    @PostMapping("/escrow/{escrowId}")
    public ResponseEntity<DisputeResponse> raiseDispute(
            @PathVariable UUID escrowId,
            @Valid @RequestBody CreateDisputeRequest request,
            @AuthenticationPrincipal User currentUser) {
        DisputeResponse response = disputeService.raiseDispute(escrowId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisputeResponse> getDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        DisputeResponse response = disputeService.getDispute(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/escrow/{escrowId}")
    public ResponseEntity<DisputeResponse> getDisputeByEscrow(
            @PathVariable UUID escrowId,
            @AuthenticationPrincipal User currentUser) {
        DisputeResponse response = disputeService.getDisputeByEscrow(escrowId, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DisputeResponse>> listUserDisputes(
            @AuthenticationPrincipal User currentUser) {
        List<DisputeResponse> response = disputeService.listUserDisputes(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DisputeResponse>> listAllDisputes() {
        List<DisputeResponse> response = disputeService.listAllDisputes();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/evidence")
    public ResponseEntity<DisputeEvidenceResponse> uploadEvidence(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        DisputeEvidenceResponse response = disputeService.uploadEvidence(id, file, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<DisputeResponse> resolveDispute(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeRequest request,
            @AuthenticationPrincipal User currentUser) {
        // Technically this should be an admin user checking
        DisputeResponse response = disputeService.resolveDispute(id, request, currentUser);
        return ResponseEntity.ok(response);
    }
}
