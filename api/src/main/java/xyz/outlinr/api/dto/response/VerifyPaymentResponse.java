package xyz.outlinr.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyPaymentResponse {
    private String status;
    private String message;
}
