package xyz.outlinr.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import xyz.outlinr.api.entity.enumeration.LedgerStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "financial_ledger")
public class FinancialLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escrow_id", nullable = false)
    private Escrow escrow;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LedgerStatus status;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payout_reference")
    private String payoutReference;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
