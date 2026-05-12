package com.hometutor.auth.controller;

import com.hometutor.auth.dto.LoginRequest;
import com.hometutor.auth.dto.RegisterRequest;
import com.hometutor.auth.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
    if (!Objects.equals(request.getPassword(), request.getConfirmPassword())) {
      return ResponseEntity.badRequest()
          .body(Map.of("errors", List.of(Map.of(
              "path", "confirmPassword",
              "msg", "Passwords do not match"))));
    }

    Map<String, Object> user = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("message", "Registration successful", "user", user));
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/logout")
  public ResponseEntity<Map<String, String>> logout() {
    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
  }
}
