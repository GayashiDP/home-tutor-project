package com.hometutor.booking.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.booking.dto.CreateBookingRequest;
import com.hometutor.booking.dto.SetSessionPriceRequest;
import com.hometutor.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
  private final AuthService authService;
  private final BookingService bookingService;

  public BookingController(AuthService authService, BookingService bookingService) {
    this.authService = authService;
    this.bookingService = bookingService;
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> createBooking(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody CreateBookingRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(userId, request));
  }

  @GetMapping({"/mine", "/my"})
  public ResponseEntity<Map<String, Object>> getMySessions(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(bookingService.getMySessions(userId));
  }

  @GetMapping("/{bookingId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
  public ResponseEntity<Map<String, Object>> getMySession(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String bookingId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(bookingService.getMySession(userId, bookingId));
  }

  @PatchMapping("/{bookingId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/cancel")
  public ResponseEntity<Map<String, Object>> cancelBooking(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String bookingId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(bookingService.cancelBooking(userId, bookingId));
  }

  @PatchMapping("/{bookingId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/price")
  public ResponseEntity<Map<String, Object>> setSessionPrice(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String bookingId,
      @Valid @RequestBody SetSessionPriceRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(bookingService.setSessionPrice(userId, bookingId, request));
  }
}
