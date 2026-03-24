package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import xyz.outlinr.api.entity.FinancialLedger;
import xyz.outlinr.api.entity.Escrow;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialLedgerRepository extends JpaRepository<FinancialLedger, UUID> {
    Optional<FinancialLedger> findByEscrow(Escrow escrow);
}
