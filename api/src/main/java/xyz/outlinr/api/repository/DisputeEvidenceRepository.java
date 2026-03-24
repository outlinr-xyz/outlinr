package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import xyz.outlinr.api.entity.DisputeEvidence;

import java.util.UUID;

@Repository
public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, UUID> {
}
