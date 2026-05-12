package com.hometutor.review.controller;

import com.hometutor.auth.service.AuthService;
import com.hometutor.review.dto.CreateReviewRequest;
import com.hometutor.review.service.ReviewService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
  private final AuthService authService;
  private final ReviewService reviewService;

  public ReviewController(AuthService authService, ReviewService reviewService) {
    this.authService = authService;
    this.reviewService = reviewService;
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> createReview(
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
      @Valid @RequestBody CreateReviewRequest request) {
    String userId = authService.requireUserId(authorizationHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(userId, request));
  }

  @GetMapping("/tutors/{tutorId}")
  public ResponseEntity<Map<String, Object>> getTutorReviews(@PathVariable String tutorId) {
    return ResponseEntity.ok(reviewService.getTutorReviews(tutorId));
  }
}
