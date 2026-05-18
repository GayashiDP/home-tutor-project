package com.hometutor.availability.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.availability.dto.SaveAvailabilityRequest;
import com.hometutor.availability.dto.UpdateAvailabilitySlotRequest;
import com.hometutor.availability.service.AvailabilityService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {
  private final AuthService authService;
  private final AvailabilityService availabilityService;

  public AvailabilityController(AuthService authService, AvailabilityService availabilityService) {
    this.authService = authService;
    this.availabilityService = availabilityService;
  }

  @GetMapping({"/mine", "/my"})
  public ResponseEntity<Map<String, Object>> getMyAvailability(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(availabilityService.getMyAvailability(userId));
  }

  @PostMapping({"/mine", "/my"})
  public ResponseEntity<Map<String, Object>> saveMyAvailability(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody SaveAvailabilityRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(availabilityService.saveMyAvailability(userId, request));
  }

  @GetMapping({"/tutors/{tutorId}", "/tutor/{tutorId}"})
  public ResponseEntity<Map<String, Object>> getTutorAvailability(@PathVariable String tutorId) {
    return ResponseEntity.ok(availabilityService.getTutorAvailability(tutorId));
  }

  @PatchMapping({"/mine/{slotId}", "/my/{slotId}"})
  public ResponseEntity<Map<String, Object>> updateMyAvailabilitySlot(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String slotId,
      @Valid @RequestBody UpdateAvailabilitySlotRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(availabilityService.updateMyAvailabilitySlot(userId, slotId, request));
  }
}
