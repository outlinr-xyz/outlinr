package xyz.outlinr.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import xyz.outlinr.api.entity.enumeration.*;
import xyz.outlinr.api.utils.EscrowDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "escrows")
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    @Builder.Default
    private String currency = EscrowDefaults.DEFAULT_CURRENCY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscrowStatus status = EscrowStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationMode participationMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryType deliveryType;

    @Column(nullable = false)
    @Builder.Default
    private Integer inspectionPeriodDays = EscrowDefaults.INSPECTION_PERIOD_DAYS;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoRelease = EscrowDefaults.AUTO_RELEASE;

    @Column(nullable = false)
    @Builder.Default
    private Integer disputeWindowHours = EscrowDefaults.DISPUTE_WINDOW_HOURS;

    @Column(nullable = false)
    @Builder.Default
    private Boolean requireProofOfDelivery = EscrowDefaults.REQUIRE_PROOF_OF_DELIVERY;

    @Column(nullable = false)
    @Builder.Default
    private Boolean milestoneEnabled = EscrowDefaults.MILESTONE_ENABLED;

    @Column(columnDefinition = "TEXT")
    private String customDeliveryNotes;

    // Physical-specific
    @Enumerated(EnumType.STRING)
    private ShippingResponsibility shippingResponsibility;

    private Integer expectedDeliveryDays;

    // Service-specific
    @Enumerated(EnumType.STRING)
    private ConfirmationMethod confirmationMethod;

    // Set at delivery time
    @Column(columnDefinition = "TEXT")
    private String deliveryEvidence;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "escrow", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EscrowParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "escrow", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<EscrowStatusHistory> statusHistory = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
