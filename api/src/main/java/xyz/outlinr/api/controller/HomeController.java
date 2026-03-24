package xyz.outlinr.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class HomeController {
    @GetMapping("/")
    ResponseEntity<Map<String, String>> home() {
        return ResponseEntity.ok(Map.of("status", HttpStatus.OK.name()));
    }
}
