package xyz.outlinr.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import xyz.outlinr.api.entity.enumeration.PayoutStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payout_transactions")
public class PayoutTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escrow_id", nullable = false)
    private Escrow escrow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(name = "bank_account_number", nullable = false)
    private String bankAccountNumber;

    @Column(name = "bank_code", nullable = false)
    private String bankCode;

    @Column(name = "transaction_reference", nullable = false, unique = true)
    private String transactionReference;

    @Column(name = "interswitch_response_code")
    private String interswitchResponseCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PayoutStatus status = PayoutStatus.PENDING;

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
