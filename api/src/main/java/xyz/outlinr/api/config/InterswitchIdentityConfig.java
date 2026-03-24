package xyz.outlinr.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "interswitch.identity")
public class InterswitchIdentityConfig {
    private String clientId;
    private String clientSecret;
    private String oauthUrl;
    private String bvnUrl;
    private String ninUrl;
}
