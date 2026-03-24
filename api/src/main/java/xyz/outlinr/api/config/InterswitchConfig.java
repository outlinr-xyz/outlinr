package xyz.outlinr.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "interswitch.payment")
public class InterswitchConfig {
    private String merchantId;
    private String payItemId;
    private String macKey;
    private String verifyUrl;
}
