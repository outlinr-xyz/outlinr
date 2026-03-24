package xyz.outlinr.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "mail.resend")
public class ResendConfig {
    private String apiKey;
    private String from;
}
