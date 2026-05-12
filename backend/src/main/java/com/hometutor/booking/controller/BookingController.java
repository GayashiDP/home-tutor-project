package com.hometutor.booking.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.booking.dto.CreateBookingRequest;
import com.hometutor.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}
