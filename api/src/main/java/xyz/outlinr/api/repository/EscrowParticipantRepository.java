package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.outlinr.api.entity.EscrowParticipant;

import java.util.Optional;
import java.util.UUID;

public interface EscrowParticipantRepository extends JpaRepository<EscrowParticipant, UUID> {

    Optional<EscrowParticipant> findByInviteToken(UUID inviteToken);
}
