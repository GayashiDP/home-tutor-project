package com.hometutor.live.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.live.dto.SaveLiveSessionRequest;
import com.hometutor.live.service.LiveSessionService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/live-sessions")
public class LiveSessionController {
  private final AuthService authService;
  private final LiveSessionService liveSessionService;

  public LiveSessionController(AuthService authService, LiveSessionService liveSessionService) {
    this.authService = authService;
    this.liveSessionService = liveSessionService;
  }

  @GetMapping({"/mine", "/my"})
  public ResponseEntity<Map<String, Object>> getMyLiveSessions(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(liveSessionService.getMyLiveSessions(userId));
  }

  @GetMapping("/booking/{bookingId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
  public ResponseEntity<Map<String, Object>> getLiveSessionForBooking(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String bookingId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(liveSessionService.getLiveSessionForBooking(userId, bookingId));
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> saveLiveSession(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody SaveLiveSessionRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(liveSessionService.saveLiveSession(userId, request));
  }

  @PatchMapping("/{liveSessionId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/cancel")
  public ResponseEntity<Map<String, Object>> cancelLiveSession(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String liveSessionId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(liveSessionService.cancelLiveSession(userId, liveSessionId));
  }

  @PatchMapping("/{liveSessionId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/complete")
  public ResponseEntity<Map<String, Object>> completeLiveSession(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String liveSessionId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(liveSessionService.completeLiveSession(userId, liveSessionId));
  }
}
