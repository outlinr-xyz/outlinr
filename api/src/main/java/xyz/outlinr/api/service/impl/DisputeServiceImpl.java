package xyz.outlinr.api.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import xyz.outlinr.api.dto.request.CreateDisputeRequest;
import xyz.outlinr.api.dto.request.ResolveDisputeRequest;
import xyz.outlinr.api.dto.response.DisputeEvidenceResponse;
import xyz.outlinr.api.dto.response.DisputeResponse;
import xyz.outlinr.api.entity.*;
import xyz.outlinr.api.entity.enumeration.DisputeResolution;
import xyz.outlinr.api.entity.enumeration.DisputeStatus;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;
import xyz.outlinr.api.entity.enumeration.LedgerStatus;
import xyz.outlinr.api.repository.DisputeEvidenceRepository;
import xyz.outlinr.api.repository.DisputeRepository;
import xyz.outlinr.api.repository.EscrowRepository;
import xyz.outlinr.api.repository.FinancialLedgerRepository;
import xyz.outlinr.api.service.DisputeService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeEvidenceRepository evidenceRepository;
    private final EscrowRepository escrowRepository;
    private final FinancialLedgerRepository ledgerRepository;

    @Value("${app.upload.dir:uploads/disputes}")
    private String uploadDir;

    @Override
    @Transactional
    public DisputeResponse raiseDispute(UUID escrowId, CreateDisputeRequest request, User currentUser) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new NoSuchElementException("Escrow not found: " + escrowId));

        assertParticipant(escrow, currentUser);

        if (escrow.getStatus() == EscrowStatus.DISPUTED) {
            throw new IllegalStateException("This escrow is already under dispute.");
        }

        if (escrow.getStatus() != EscrowStatus.DELIVERED && escrow.getStatus() != EscrowStatus.INSPECTION) {
             throw new IllegalStateException("Disputes can only be raised during Delivery or Inspection phases.");
        }

        // Change Status
        EscrowStatus fromStatus = escrow.getStatus();
        escrow.setStatus(EscrowStatus.DISPUTED);

        EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(fromStatus)
                .toStatus(EscrowStatus.DISPUTED)
                .changedBy(currentUser)
                .reason("Dispute raised: " + request.reason())
                .build();
        escrow.getStatusHistory().add(history);
        escrowRepository.save(escrow);

        // Calculate deadline (e.g., 48 hours to resolve)
        Instant deadline = Instant.now().plus(escrow.getDisputeWindowHours(), ChronoUnit.HOURS);

        Dispute dispute = Dispute.builder()
                .escrow(escrow)
                .raisedBy(currentUser)
                .reason(request.reason())
                .status(DisputeStatus.OPEN)
                .deadline(deadline)
                .build();

        Dispute saved = disputeRepository.save(dispute);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getDispute(UUID disputeId, User currentUser) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new NoSuchElementException("Dispute not found: " + disputeId));
        assertParticipant(dispute.getEscrow(), currentUser);
        return toResponse(dispute);
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getDisputeByEscrow(UUID escrowId, User currentUser) {
        Dispute dispute = disputeRepository.findByEscrowId(escrowId)
                .orElseThrow(() -> new NoSuchElementException("No dispute found for escrow: " + escrowId));
        assertParticipant(dispute.getEscrow(), currentUser);
        return toResponse(dispute);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisputeResponse> listUserDisputes(User currentUser) {
        // Find escrows user is in, get disputes for those escrows.
        // For efficiency in a real app, write a custom query in DisputeRepository
        List<Escrow> userEscrows = escrowRepository.findByParticipantUser(currentUser);
        return userEscrows.stream()
                .map(e -> disputeRepository.findByEscrowId(e.getId()).orElse(null))
                .filter(d -> d != null)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisputeResponse> listAllDisputes() {
        return disputeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public DisputeEvidenceResponse uploadEvidence(UUID disputeId, MultipartFile file, User currentUser) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new NoSuchElementException("Dispute not found: " + disputeId));
        assertParticipant(dispute.getEscrow(), currentUser);

        if (dispute.getStatus() != DisputeStatus.OPEN) {
            throw new IllegalStateException("Cannot upload evidence to a closed or resolved dispute.");
        }

        try {
            // Save file
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Assuming we serve files from /api/files/{fileName}
            String fileUrl = "/api/files/disputes/" + fileName;

            DisputeEvidence evidence = DisputeEvidence.builder()
                    .dispute(dispute)
                    .uploadedBy(currentUser)
                    .fileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .originalFileName(file.getOriginalFilename())
                    .build();

            evidence = evidenceRepository.save(evidence);

            return new DisputeEvidenceResponse(
                    evidence.getId(),
                    evidence.getUploadedBy().getName(),
                    evidence.getFileUrl(),
                    evidence.getFileType(),
                    evidence.getOriginalFileName(),
                    evidence.getUploadedAt()
            );

        } catch (IOException e) {
            log.error("Failed to store evidence file", e);
            throw new RuntimeException("Failed to store evidence file", e);
        }
    }

    @Override
    @Transactional
    public DisputeResponse resolveDispute(UUID disputeId, ResolveDisputeRequest request, User adminUser) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new NoSuchElementException("Dispute not found: " + disputeId));

        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            throw new IllegalStateException("Dispute is already resolved.");
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(request.resolution());
        dispute.setAdminNotes(request.adminNotes());

        Escrow escrow = dispute.getEscrow();
        
        // Handle financial outcome
        FinancialLedger ledger = ledgerRepository.findByEscrow(escrow)
                .orElseThrow(() -> new IllegalStateException("No ledger entry found for this escrow"));

        if (request.resolution() == DisputeResolution.REFUNDED) {
            escrow.setStatus(EscrowStatus.REFUNDED);
            ledger.setStatus(LedgerStatus.REFUNDED);
        } else if (request.resolution() == DisputeResolution.RELEASED) {
            escrow.setStatus(EscrowStatus.COMPLETED);
            ledger.setStatus(LedgerStatus.PENDING_PAYOUT);
            // In a complete implementation, this would trigger the actual payout routine here
        }

        EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(EscrowStatus.DISPUTED)
                .toStatus(escrow.getStatus())
                .changedBy(adminUser)
                .reason("Dispute Resolved: " + request.resolution())
                .build();
        escrow.getStatusHistory().add(history);

        escrowRepository.save(escrow);
        ledgerRepository.save(ledger);
        Dispute saved = disputeRepository.save(dispute);
        
        return toResponse(saved);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    @Transactional
    public void autoResolveExpiredDisputes() {
        log.info("Running auto-resolve job for expired disputes...");
        List<Dispute> expiredDisputes = disputeRepository.findByStatusAndDeadlineBefore(DisputeStatus.OPEN, Instant.now());
        
        for (Dispute dispute : expiredDisputes) {
            log.info("Auto-resolving expired dispute: {}", dispute.getId());
            
            // By default, if the deadline passes, we assume the raiser wins (Refunded if raised by buyer, released if raised by seller)
            // Just for simplicity, we'll default to REFUNDED to protect the buyer if seller ghosts.
            ResolveDisputeRequest request = new ResolveDisputeRequest(
                DisputeResolution.REFUNDED,
                "Auto-resolved due to deadline expiration."
            );

            // User resolving is "System" (null or generic admin)
            // Passing null might cause NullPointerException depending on builder constraints in EscrowStatusHistory, 
            // so let's bypass the controller method and do it manually here for system context.
            dispute.setStatus(DisputeStatus.RESOLVED);
            dispute.setResolution(DisputeResolution.REFUNDED);
            dispute.setAdminNotes(request.adminNotes());

            Escrow escrow = dispute.getEscrow();
            escrow.setStatus(EscrowStatus.REFUNDED);

            EscrowStatusHistory history = EscrowStatusHistory.builder()
                .escrow(escrow)
                .fromStatus(EscrowStatus.DISPUTED)
                .toStatus(EscrowStatus.REFUNDED)
                .changedBy(null) // System
                .reason(request.adminNotes())
                .build();
            escrow.getStatusHistory().add(history);
            
            FinancialLedger ledger = ledgerRepository.findByEscrow(escrow)
                .orElseThrow();
            ledger.setStatus(LedgerStatus.REFUNDED);

            escrowRepository.save(escrow);
            ledgerRepository.save(ledger);
            disputeRepository.save(dispute);
        }
    }

    private void assertParticipant(Escrow escrow, User user) {
        boolean isParticipant = escrow.getParticipants().stream()
                .anyMatch(p -> p.getUser() != null && p.getUser().getId().equals(user.getId()));
        if (!isParticipant) {
            // Check if admin (not implemented for simplicity, assuming everyone fails if not directly involved)
            throw new SecurityException("You are not a participant of this escrow or dispute");
        }
    }

    private DisputeResponse toResponse(Dispute dispute) {
        List<DisputeEvidenceResponse> evidenceResponses = dispute.getEvidence().stream()
                .map(e -> new DisputeEvidenceResponse(
                        e.getId(),
                        e.getUploadedBy() != null ? e.getUploadedBy().getName() : "System",
                        e.getFileUrl(),
                        e.getFileType(),
                        e.getOriginalFileName(),
                        e.getUploadedAt()))
                .toList();

        return new DisputeResponse(
                dispute.getId(),
                dispute.getEscrow().getId(),
                dispute.getRaisedBy() != null ? dispute.getRaisedBy().getName() : "Unknown",
                dispute.getReason(),
                dispute.getStatus(),
                dispute.getResolution(),
                dispute.getAdminNotes(),
                dispute.getDeadline(),
                dispute.getCreatedAt(),
                dispute.getUpdatedAt(),
                evidenceResponses
        );
    }
}
