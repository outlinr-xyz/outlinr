package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import xyz.outlinr.api.entity.Dispute;
import xyz.outlinr.api.entity.enumeration.DisputeStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Optional<Dispute> findByEscrowId(UUID escrowId);
    List<Dispute> findByStatusAndDeadlineBefore(DisputeStatus status, Instant deadline);
}
