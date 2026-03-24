package xyz.outlinr.api.service;

import xyz.outlinr.api.dto.request.CreateEscrowRequest;
import xyz.outlinr.api.dto.request.VerifyAndCreateEscrowRequest;
import xyz.outlinr.api.dto.response.InitPaymentResponse;
import xyz.outlinr.api.dto.response.VerifyPaymentResponse;
import xyz.outlinr.api.entity.User;

import java.util.UUID;

public interface PaymentService {
    /**
     * Initiates a payment for the specified escrow by the current user.
     * Returns the Webpay checkout parameters (merchant ID, mac, txn ref, etc).
     */
    InitPaymentResponse initiatePayment(UUID escrowId, User currentUser);

    /**
     * Initiates payment for a BRAND NEW escrow (not yet saved to DB).
     */
    InitPaymentResponse initiateNewEscrowPayment(CreateEscrowRequest request, User currentUser);

    /**
     * Verifies the given transaction reference with Interswitch.
     * Returns true if successful and marks the escrow paid, otherwise false.
     */
    boolean verifyTransaction(String transactionReference);

    /**
     * Verifies transaction with Interswitch and funds escrow if success
     */
    boolean verifyAndFundEscrow(UUID escrowId, String transactionReference, long amountInKobo);

    /**
     * Atomic: verify payment AND create escrow if success.
     */
    VerifyPaymentResponse verifyAndCreateEscrow(VerifyAndCreateEscrowRequest request, User currentUser);

    VerifyPaymentResponse verifyEscrowPayment(UUID escrowId, String transactionReference, long amountInKobo);
}
