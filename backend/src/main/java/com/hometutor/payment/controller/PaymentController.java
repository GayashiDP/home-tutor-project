package com.hometutor.payment.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.payment.service.PaymentService;
import com.hometutor.user.UserRepository.PaymentSlipRecord;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final AuthService authService;
  private final PaymentService paymentService;

  public PaymentController(AuthService authService, PaymentService paymentService) {
    this.authService = authService;
    this.paymentService = paymentService;
  }

  @GetMapping("/history")
  public ResponseEntity<Map<String, Object>> history(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
  }

  @PostMapping("/slips/{bookingId}")
  public ResponseEntity<Map<String, Object>> uploadSlip(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String bookingId,
      @RequestParam("slip") MultipartFile slip) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.uploadSlip(userId, bookingId, slip));
  }

  @GetMapping("/approvals")
  public ResponseEntity<Map<String, Object>> pendingApprovals(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.getPendingApprovals(userId));
  }

  @PatchMapping("/{paymentId}/approve")
  public ResponseEntity<Map<String, Object>> approve(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String paymentId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.approvePayment(userId, paymentId));
  }

  @PatchMapping("/{paymentId}/reject")
  public ResponseEntity<Map<String, Object>> reject(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String paymentId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(paymentService.rejectPayment(userId, paymentId));
  }

  @GetMapping("/{paymentId}/slip")
  public ResponseEntity<byte[]> slip(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String paymentId) {
    String userId = authService.requireUserId(authorizationHeader);
    PaymentSlipRecord slip = paymentService.getPaymentSlip(userId, paymentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(slip.contentType()))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + slip.fileName().replace("\"", "") + "\"")
        .body(slip.data());
  }
}
