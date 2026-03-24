package xyz.outlinr.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitPaymentResponse {
    private String productId;
    private String payItemId;
    private String amount;
    private String currency;
    private String siteRedirectUrl;
    private String txnRef;
    private String hash;
    private String custId;
    private String custIdDesc;
    private String custName;
    private String custEmail;
}
