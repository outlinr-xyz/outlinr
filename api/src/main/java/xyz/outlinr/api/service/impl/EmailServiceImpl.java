package xyz.outlinr.api.service.impl;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import xyz.outlinr.api.config.ResendConfig;
import xyz.outlinr.api.entity.Escrow;
import xyz.outlinr.api.entity.EscrowParticipant;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.entity.enumeration.ParticipantRole;
import xyz.outlinr.api.service.EmailService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final TemplateEngine templateEngine;
    private final ResendConfig resendConfig;

    @Value("${app.frontend.url:http://app.outlinr.xyz}")
    private String frontendUrl;

    /**
     * Balanced email dispatch for any creator role:
     * 1. Sends the CREATOR a confirmation email with a direct "View Transaction" link.
     * 2. Sends every NON-CREATOR participant (inviteAccepted == false) an invite email
     *    with their personal magic-link token.
     *
     * This handles all three participation modes correctly:
     *  - SELF_AS_BUYER  → buyer (creator) gets confirmation; seller gets invite.
     *  - SELF_AS_SELLER → seller (creator) gets confirmation; buyer gets invite.
     *  - AGENT          → agent (creator) gets confirmation; both buyer & seller get invites.
     */
    @Async
    @Override
    public void sendEscrowInviteEmails(Escrow escrow, User creator) {
        List<EscrowParticipant> participants = escrow.getParticipants();

        // ── 1. Send confirmation to the creator ──────────────────────────────────
        EscrowParticipant creatorParticipant = participants.stream()
                .filter(p -> p.getUser() != null && p.getUser().getId().equals(creator.getId()))
                .findFirst()
                .orElse(null);

        if (creatorParticipant != null) {
            Context creatorCtx = buildCreatorContext(creatorParticipant, escrow, participants);
            String subject = "Your Escrow Transaction Has Been Created";
            sendHtmlEmail(creatorParticipant.getEmail(), subject, "escrow-email-creator", creatorCtx);
            log.info("Sent escrow creator confirmation to {} for escrow {}", creatorParticipant.getEmail(), escrow.getId());
        } else {
            log.warn("No creator participant found for escrow {}. Skipping creator confirmation email.", escrow.getId());
        }

        // ── 2. Send invite emails to every uninvited (non-creator) participant ───
        List<EscrowParticipant> uninvited = participants.stream()
                .filter(p -> Boolean.FALSE.equals(p.getInviteAccepted()))
                .toList();

        for (EscrowParticipant invitee : uninvited) {
            Context inviteCtx = buildInviteContext(invitee, creatorParticipant, escrow);
            String roleLabel = toRoleLabel(invitee.getRole());
            String subject = "You've Been Invited to an Escrow Transaction as " + roleLabel;
            sendHtmlEmail(invitee.getEmail(), subject, "escrow-email-invite", inviteCtx);
            log.info("Sent escrow invite to {} ({}) for escrow {}", invitee.getEmail(), roleLabel, escrow.getId());
        }
    }

    // ── Template context builders ─────────────────────────────────────────────

    /**
     * Builds the Thymeleaf context for the creator's confirmation email.
     */
    private Context buildCreatorContext(EscrowParticipant creator, Escrow escrow,
                                        List<EscrowParticipant> allParticipants) {
        String viewLink = frontendUrl + "/escrow/" + escrow.getId() + "/dashboard";

        // Build a human-readable "next step" message based on who else is in the escrow
        long invitedCount = allParticipants.stream()
                .filter(p -> Boolean.FALSE.equals(p.getInviteAccepted()))
                .count();
        String nextStep;
        if (invitedCount == 0) {
            nextStep = "All participants have been confirmed. The escrow is now active.";
        } else if (invitedCount == 1) {
            nextStep = "We've sent an invitation to the other party. The escrow will proceed once they accept.";
        } else {
            nextStep = "We've sent invitations to " + invitedCount + " participants. The escrow will proceed once they all accept.";
        }

        Context ctx = new Context();
        ctx.setVariable("creatorName", creator.getName() != null ? creator.getName() : "there");
        ctx.setVariable("escrowTitle", escrow.getTitle());
        ctx.setVariable("transactionId", escrow.getId());
        ctx.setVariable("amount", escrow.getAmount());
        ctx.setVariable("status", escrow.getStatus());
        ctx.setVariable("viewLink", viewLink);
        ctx.setVariable("nextStepMessage", nextStep);
        return ctx;
    }

    /**
     * Builds the Thymeleaf context for an invitee's invite email.
     */
    private Context buildInviteContext(EscrowParticipant invitee, EscrowParticipant creator, Escrow escrow) {
        // Magic-link: takes the invitee directly to accept the escrow after login/signup
        String inviteLink = frontendUrl + "/invite/" + invitee.getInviteToken();

        String creatorName = (creator != null && creator.getName() != null)
                ? creator.getName()
                : escrow.getCreatedBy().getName();

        Context ctx = new Context();
        ctx.setVariable("recipientName", invitee.getName() != null ? invitee.getName() : "there");
        ctx.setVariable("recipientRole", toRoleLabel(invitee.getRole()));
        ctx.setVariable("creatorName", creatorName);
        ctx.setVariable("escrowTitle", escrow.getTitle());
        ctx.setVariable("transactionId", escrow.getId());
        ctx.setVariable("amount", escrow.getAmount());
        ctx.setVariable("status", escrow.getStatus());
        ctx.setVariable("acceptanceLink", inviteLink);
        return ctx;
    }

    // ── Shared email sender ───────────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String templateName, Context context) {
        String htmlContent = templateEngine.process(templateName, context);
        String uniqueId = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                + "-" + UUID.randomUUID().toString().substring(0, 5);

        try {
            Resend resend = new Resend(resendConfig.getApiKey());

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Outlinr <" + resendConfig.getFrom() + ">")
                    .to(to)
                    .subject(subject + " (" + uniqueId + ")")
                    .html(htmlContent)
                    .build();

            CreateEmailResponse data = resend.emails().send(params);
            log.info("Email sent via Resend to [{}] — Message ID: {}", to, data.getId());
        } catch (ResendException e) {
            log.error("Failed to send email via Resend to [{}]: {}", to, e.getMessage(), e);
        }
    }

    // ── Utility ──────────────────────────────────────────────────────────────

    private String toRoleLabel(ParticipantRole role) {
        if (role == null) return "Participant";
        return switch (role) {
            case BUYER  -> "Buyer";
            case SELLER -> "Seller";
            case AGENT  -> "Agent";
        };
    }
}
