package xyz.outlinr.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.core.AuthenticationException;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<?> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<?> handleInvalidToken(InvalidTokenException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateTransitionException.class)
    public ResponseEntity<?> handleIllegalStateTransition(IllegalStateTransitionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleAccessDenied(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex) {
        log.error("Authentication error", ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Authentication failed."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        log.error("Unhandled generic exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred. Please try again later."));
    }
}
