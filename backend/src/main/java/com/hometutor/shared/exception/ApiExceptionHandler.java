package com.hometutor.shared.exception;

import com.hometutor.auth.exception.AuthenticationRequiredException;
import com.hometutor.auth.exception.DuplicateEmailException;
import com.hometutor.auth.exception.InvalidCredentialsException;
import com.hometutor.availability.exception.AvailabilitySlotNotFoundException;
import com.hometutor.availability.exception.ConfirmedBookingConflictException;
import com.hometutor.booking.exception.BookingCancellationException;
import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.booking.exception.SlotUnavailableException;
import com.hometutor.booking.exception.StudentOnlyBookingException;
import com.hometutor.payment.exception.PaymentFailedException;
import com.hometutor.profile.exception.ProfileNotFoundException;
import com.hometutor.review.exception.DuplicateReviewException;
import com.hometutor.review.exception.ReviewNotAllowedException;
import com.hometutor.subject.exception.DuplicateSubjectException;
import com.hometutor.subject.exception.SubjectNotFoundException;
import com.hometutor.subject.exception.TutorOnlySubjectException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
    List<Map<String, String>> errors = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> Map.of(
            "path", error.getField(),
            "msg", error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage()))
        .toList();

    return ResponseEntity.badRequest().body(Map.of("errors", errors));
  }

  @ExceptionHandler(DuplicateEmailException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateEmail() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "Email already registered", "field", "email"));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleInvalidCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Invalid email or password"));
  }

  @ExceptionHandler(AuthenticationRequiredException.class)
  public ResponseEntity<Map<String, String>> handleAuthenticationRequired() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Please log in to continue"));
  }

  @ExceptionHandler(ProfileNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleProfileNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Profile not found"));
  }

  @ExceptionHandler(TutorNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleTutorNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Tutor not found"));
  }

  @ExceptionHandler(DuplicateSubjectException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateSubject() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "Subject already exists", "field", "name"));
  }

  @ExceptionHandler(SubjectNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleSubjectNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Subject not found"));
  }

  @ExceptionHandler(TutorOnlySubjectException.class)
  public ResponseEntity<Map<String, String>> handleTutorOnlySubject() {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("error", "Only tutors can manage subjects"));
  }

  @ExceptionHandler(AvailabilitySlotNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleAvailabilitySlotNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Availability slot not found"));
  }

  @ExceptionHandler(ConfirmedBookingConflictException.class)
  public ResponseEntity<Map<String, String>> handleConfirmedBookingConflict() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "This change conflicts with a confirmed booking"));
  }

  @ExceptionHandler(StudentOnlyBookingException.class)
  public ResponseEntity<Map<String, String>> handleStudentOnlyBooking() {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("error", "Only students can book tutor sessions"));
  }

  @ExceptionHandler(BookingNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleBookingNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Session not found"));
  }

  @ExceptionHandler(BookingCancellationException.class)
  public ResponseEntity<Map<String, String>> handleBookingCancellation(BookingCancellationException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(SlotUnavailableException.class)
  public ResponseEntity<Map<String, String>> handleSlotUnavailable() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "This time slot is no longer available"));
  }

  @ExceptionHandler(PaymentFailedException.class)
  public ResponseEntity<Map<String, String>> handlePaymentFailed(PaymentFailedException exception) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(DuplicateReviewException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateReview() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "You have already reviewed this session"));
  }

  @ExceptionHandler(ReviewNotAllowedException.class)
  public ResponseEntity<Map<String, String>> handleReviewNotAllowed(ReviewNotAllowedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
    return ResponseEntity.badRequest()
        .body(Map.of("error", exception.getMessage() == null ? "Invalid request" : exception.getMessage()));
  }

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<Map<String, String>> handleNoResourceFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Endpoint not found"));
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<Map<String, String>> handleDatabaseException(DataAccessException exception) {
    logger.error("Database error", exception);
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(Map.of("error", "Database unavailable. Check Supabase connection and migrations."));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleException(Exception exception) {
    logger.error("Unhandled API error", exception);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "Internal server error"));
  }
}
