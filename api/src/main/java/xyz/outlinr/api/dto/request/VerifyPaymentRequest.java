package xyz.outlinr.api.dto.request;

import lombok.Data;

@Data
public class VerifyPaymentRequest {
    private String txnRef;
    private long amount;
}
