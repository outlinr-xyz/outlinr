package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.outlinr.api.entity.Escrow;
import xyz.outlinr.api.entity.EscrowStatusHistory;

import java.util.List;
import java.util.UUID;

public interface EscrowStatusHistoryRepository extends JpaRepository<EscrowStatusHistory, UUID> {

    List<EscrowStatusHistory> findByEscrowOrderByTimestampAsc(Escrow escrow);
}
