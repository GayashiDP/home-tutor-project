package com.hometutor.admin.controller;

import com.hometutor.admin.service.AdminService;
import com.hometutor.auth.service.AuthService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AuthService authService;
  private final AdminService adminService;

  public AdminController(AuthService authService, AdminService adminService) {
    this.authService = authService;
    this.adminService = adminService;
  }

  @GetMapping("/users")
  public ResponseEntity<Map<String, Object>> getUsers(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(adminService.getUsers(userId));
  }

  @PatchMapping("/tutors/{tutorId}/suspend")
  public ResponseEntity<Map<String, Object>> suspendTutor(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String tutorId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(adminService.suspendTutor(userId, tutorId));
  }

  @PatchMapping("/tutors/{tutorId}/activate")
  public ResponseEntity<Map<String, Object>> activateTutor(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String tutorId) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(adminService.activateTutor(userId, tutorId));
  }
}
