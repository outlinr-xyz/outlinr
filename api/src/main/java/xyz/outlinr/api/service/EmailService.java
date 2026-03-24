package xyz.outlinr.api.service;

import xyz.outlinr.api.entity.Escrow;
import xyz.outlinr.api.entity.User;

public interface EmailService {
    /**
     * Sends emails to all parties involved in an escrow creation:
     * - The creator receives a confirmation "view transaction" email.
     * - All non-creator participants (inviteAccepted = false) receive an invite email
     *   with their unique magic-link token.
     *
     * @param escrow   the newly-created escrow
     * @param creator  the user who created the escrow (buyer, seller, or agent)
     */
    void sendEscrowInviteEmails(Escrow escrow, User creator);
}
