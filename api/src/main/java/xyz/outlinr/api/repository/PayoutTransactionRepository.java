package xyz.outlinr.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.outlinr.api.entity.PayoutTransaction;
import java.util.UUID;

public interface PayoutTransactionRepository extends JpaRepository<PayoutTransaction, UUID> {
}
