package com.hometutor.subject.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.subject.dto.CreateSubjectRequest;
import com.hometutor.subject.service.SubjectService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
  private final AuthService authService;
  private final SubjectService subjectService;

  public SubjectController(AuthService authService, SubjectService subjectService) {
    this.authService = authService;
    this.subjectService = subjectService;
  }

  @GetMapping("/mine")
  public ResponseEntity<Map<String, Object>> getMySubjects(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(subjectService.getMySubjects(userId));
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> createSubject(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody CreateSubjectRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.createSubject(userId, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> deleteSubject(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @PathVariable String id) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.ok(subjectService.deleteSubject(userId, id));
  }
}
