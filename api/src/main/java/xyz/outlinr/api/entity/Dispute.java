package xyz.outlinr.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import xyz.outlinr.api.entity.enumeration.DisputeResolution;
import xyz.outlinr.api.entity.enumeration.DisputeStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "disputes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dispute {
    @Id
    @UuidGenerator
    @GeneratedValue
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escrow_id", nullable = false)
    private Escrow escrow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_user_id", nullable = false)
    private User raisedBy;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DisputeStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DisputeResolution resolution;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @Column(nullable = false)
    private Instant deadline;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DisputeEvidence> evidence = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
