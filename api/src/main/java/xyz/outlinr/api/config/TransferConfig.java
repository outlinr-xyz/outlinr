package xyz.outlinr.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "interswitch.transfer")
public class TransferConfig {
    private String clientId;
    private String clientSecret;
    private String nameEnquiryUrl;
    private String transferUrl;
}
