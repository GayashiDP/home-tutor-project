package com.hometutor.shared.exception;

import com.hometutor.auth.exception.AuthenticationRequiredException;
import com.hometutor.auth.exception.DuplicateEmailException;
import com.hometutor.auth.exception.InvalidCredentialsException;
import com.hometutor.profile.exception.ProfileNotFoundException;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
    List<Map<String, String>> errors = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> Map.of(
            "path", error.getField(),
            "msg", error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage()))
        .toList();

    return ResponseEntity.badRequest().body(Map.of("errors", errors));
  }

  @ExceptionHandler(DuplicateEmailException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateEmail() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "Email already registered", "field", "email"));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleInvalidCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Invalid email or password"));
  }

  @ExceptionHandler(AuthenticationRequiredException.class)
  public ResponseEntity<Map<String, String>> handleAuthenticationRequired() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Please log in to continue"));
  }

  @ExceptionHandler(ProfileNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleProfileNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Profile not found"));
  }

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<Map<String, String>> handleNoResourceFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Endpoint not found"));
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<Map<String, String>> handleDatabaseException(DataAccessException exception) {
    logger.error("Database error", exception);
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(Map.of("error", "Database unavailable. Check Supabase connection and migrations."));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleException(Exception exception) {
    logger.error("Unhandled API error", exception);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "Internal server error"));
  }
}
