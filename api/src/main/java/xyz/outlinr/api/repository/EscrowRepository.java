package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import xyz.outlinr.api.entity.Escrow;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;
import xyz.outlinr.api.entity.User;

import java.util.List;
import java.util.UUID;

public interface EscrowRepository extends JpaRepository<Escrow, UUID> {

    @Query("SELECT DISTINCT e FROM Escrow e JOIN e.participants p WHERE p.user = :user")
    List<Escrow> findByParticipantUser(@Param("user") User user);

    @Query("SELECT DISTINCT e FROM Escrow e JOIN e.participants p WHERE p.user = :user AND e.status = :status")
    List<Escrow> findByParticipantUserAndStatus(@Param("user") User user, @Param("status") EscrowStatus status);
}
