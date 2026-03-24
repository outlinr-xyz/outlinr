package xyz.outlinr.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OutlinrApplication {
	public static void main(String[] args) {
		SpringApplication.run(OutlinrApplication.class, args);
	}
}
