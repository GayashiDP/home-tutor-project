package com.hometutor.availability.controller;

// Import AuthService to get/check the logged-in user from the Authorization header
import com.hometutor.auth.service.AuthService;

// Import DTO classes used to receive request body data
import com.hometutor.availability.dto.SaveAvailabilityRequest;
import com.hometutor.availability.dto.UpdateAvailabilitySlotRequest;

// Import service class that contains availability business logic
import com.hometutor.availability.service.AvailabilityService;

// Import validation annotation to validate request body data
import jakarta.validation.Valid;

// Import Map to return response data as key-value pairs
import java.util.Map;

// Import Spring classes for HTTP response and REST mappings
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Marks this class as a REST controller.
// It handles HTTP requests and returns JSON responses.
@RestController

// Base URL path for all availability-related APIs
@RequestMapping("/api/availability")
public class AvailabilityController {

  // Service used to authenticate user and extract user ID from token/header
  private final AuthService authService;

  // Service used to handle availability-related operations
  private final AvailabilityService availabilityService;

  // Constructor injection:
  // Spring automatically provides AuthService and AvailabilityService objects here.
  public AvailabilityController(AuthService authService, AvailabilityService availabilityService) {
    this.authService = authService;
    this.availabilityService = availabilityService;
  }

  // GET API to get the logged-in user's own availability
  // URL: GET /api/availability/mine
  @GetMapping("/mine")
  public ResponseEntity<Map<String, Object>> getMyAvailability(
      // Reads the Authorization header from the request.
      // required = false means the request can come without this header,
      // but authService.requireUserId() will still check and handle authentication.
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

    // Get the logged-in user's ID using the Authorization header
    String userId = authService.requireUserId(authorizationHeader);

    // Call service method and return the user's availability as HTTP 200 OK response
    return ResponseEntity.ok(availabilityService.getMyAvailability(userId));
  }

  // POST API to save or create the logged-in user's availability
  // URL: POST /api/availability/mine
  @PostMapping("/mine")
  public ResponseEntity<Map<String, Object>> saveMyAvailability(
      // Reads Authorization header to identify the logged-in user
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,

      // Reads JSON request body and validates it using DTO validation rules
      @Valid @RequestBody SaveAvailabilityRequest request) {

    // Get the logged-in user's ID
    String userId = authService.requireUserId(authorizationHeader);

    // Save availability using service layer and return response
    return ResponseEntity.ok(availabilityService.saveMyAvailability(userId, request));
  }

  // GET API to view a specific tutor's availability
  // URL: GET /api/availability/tutors/{tutorId}
  @GetMapping("/tutors/{tutorId}")
  public ResponseEntity<Map<String, Object>> getTutorAvailability(
      // Reads tutorId from the URL path
      @PathVariable String tutorId) {

    // Get tutor availability using tutorId and return it as HTTP 200 OK response
    return ResponseEntity.ok(availabilityService.getTutorAvailability(tutorId));
  }

  // PATCH API to update one availability slot of the logged-in user
  // URL: PATCH /api/availability/mine/{slotId}
  @PatchMapping("/mine/{slotId}")
  public ResponseEntity<Map<String, Object>> updateMyAvailabilitySlot(
      // Reads Authorization header to identify the logged-in user
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,

      // Reads slotId from the URL path
      @PathVariable String slotId,

      // Reads and validates update details from request body
      @Valid @RequestBody UpdateAvailabilitySlotRequest request) {

    // Get the logged-in user's ID
    String userId = authService.requireUserId(authorizationHeader);

    // Update the selected availability slot and return updated response
    return ResponseEntity.ok(availabilityService.updateMyAvailabilitySlot(userId, slotId, request));
  }
}
