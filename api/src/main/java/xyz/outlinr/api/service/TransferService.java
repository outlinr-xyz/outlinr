package xyz.outlinr.api.service;

import java.math.BigDecimal;

public interface TransferService {
    
    // Validates if an account number is correct for a given bank code
    boolean validateAccount(String accountNumber, String bankCode);
    
    // Initiates the actual transfer to the seller
    boolean initiateTransfer(BigDecimal amount, String description, String toAccount, String bankCode, String txnRef);
}
