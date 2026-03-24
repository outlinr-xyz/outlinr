package xyz.outlinr.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import xyz.outlinr.api.entity.enumeration.AccountStatus;
import xyz.outlinr.api.entity.enumeration.KycType;
import xyz.outlinr.api.entity.enumeration.UserTier;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    @Builder.Default
    private AccountType accountType = AccountType.INDIVIDUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_tier", nullable = false)
    @Builder.Default
    private UserTier userTier = UserTier.FULL;

    @Column(name = "identity_verified", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean identityVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_type")
    private KycType kycType;

    @Column(name = "kyc_id")
    private String kycId;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "bank_name")
    private String bankName;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    public enum AccountType {
        INDIVIDUAL, COMPANY
    }

    // ── UserDetails implementation ──

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
