package com.hometutor.payment.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.payment.dto.CheckoutRequest;
import com.hometutor.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final AuthService authService;
  private final PaymentService paymentService;

  public PaymentController(AuthService authService, PaymentService paymentService) {
    this.authService = authService;
    this.paymentService = paymentService;
  }

  @PostMapping("/checkout")
  public ResponseEntity<Map<String, Object>> checkout(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody CheckoutRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.checkout(userId, request));
  }

  @GetMapping("/history")
  public ResponseEntity<Map<String, Object>> history(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
  }
}
