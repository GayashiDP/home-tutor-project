package com.hometutor.profile.controller;

//feat: implement ProfileController for user profile management
//Add GET endpoint to retrieve user profile details using auth token
//Add PATCH endpoint to update profile attributes with request validation
//Integrate AuthService for user ID extraction and session refreshing
//Connect profile service layer for state modifications  


import com.hometutor.auth.service.AuthService;
import com.hometutor.profile.dto.UpdateProfileRequest;
import com.hometutor.profile.service.ProfileService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
  private final AuthService authService;
  private final ProfileService profileService;

  public ProfileController(AuthService authService, ProfileService profileService) {
    this.authService = authService;
    this.profileService = profileService;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> getProfile(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(profileService.getProfile(userId));
  }

  @PatchMapping
  public ResponseEntity<Map<String, Object>> updateProfile(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody UpdateProfileRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    Map<String, Object> profile = profileService.updateProfile(userId, request);
    authService.refreshSessionUser(authorizationHeader, profile);
    return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "profile", profile));
  }
}
