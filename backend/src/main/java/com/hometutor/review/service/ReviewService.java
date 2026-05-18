package com.hometutor.review.service; // Define the package for this service class

import com.hometutor.booking.exception.BookingNotFoundException;// Exception thrown when a booking is not found
import com.hometutor.review.dto.CreateReviewRequest;// DTO carrying the review creation payload
import com.hometutor.review.exception.DuplicateReviewException;// Exception for duplicate review attempts
import com.hometutor.review.exception.ReviewNotFoundException;
import com.hometutor.review.exception.ReviewNotAllowedException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.ReviewRecord;
import com.hometutor.user.UserRepository.SessionRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// Registers this class as a Spring service component
@Service
public class ReviewService {
  private final UserRepository userRepository;

  public ReviewService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }
// Returns all reviews for a given tutor along with computed stats (average rating and count)
  public Map<String, Object> createReview(String userId, CreateReviewRequest request) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      throw new ReviewNotAllowedException("Only students can leave reviews");
    }

    SessionRecord session = userRepository.findSessionByIdForStudent(user.id(), request.getBookingId())
        .orElseThrow(BookingNotFoundException::new);

    if (!"Completed".equals(session.status())) {
      throw new ReviewNotAllowedException("Reviews can only be posted after a completed session");
    }

    if (userRepository.reviewExistsForBookingAndStudent(request.getBookingId(), user.id())) {
      throw new DuplicateReviewException();
    }

    try {
      ReviewRecord review = userRepository.createReview(
          request.getBookingId(),
          user.id(),
          session.tutorId(),
          request.getRating(),
          request.getComment() == null ? "" : request.getComment().trim());

      return Map.of("message", "Review submitted successfully", "review", toMap(review));
    } catch (DuplicateKeyException exception) {
      throw new DuplicateReviewException();
    }
  }

  public Map<String, Object> getTutorReviews(String tutorId) {
    if (userRepository.findTutorById(tutorId).isEmpty()) {
      throw new TutorNotFoundException();
    }

    List<ReviewRecord> reviews = userRepository.findReviewsByTutorId(tutorId);
    BigDecimal average = reviews.isEmpty()
        ? BigDecimal.ZERO
        : BigDecimal.valueOf(reviews.stream().mapToInt(ReviewRecord::rating).average().orElse(0))
            .setScale(1, RoundingMode.HALF_UP);

    return Map.of(
        "reviews", reviews.stream().map(this::toMap).toList(),
        "stats", Map.of("average", average, "count", reviews.size()));
  }

  public Map<String, Object> getAllReviews(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(() -> new ReviewNotAllowedException("Only admins can manage reviews"));

    requireAdmin(user);

    return Map.of("reviews", userRepository.findAllReviewsForAdmin().stream().map(this::toMap).toList());
  }

  @Transactional
  public Map<String, Object> deleteReview(String userId, String reviewId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(() -> new ReviewNotAllowedException("Only admins can manage reviews"));

    requireAdmin(user);

    ReviewRecord review = userRepository.findReviewById(reviewId)
        .orElseThrow(ReviewNotFoundException::new);

    userRepository.deleteReviewById(review.id());
    userRepository.createAuditLog(user.id(), "DELETE_REVIEW", "reviews", review.id(),
        "Deleted review for booking " + review.bookingId() + " from tutor " + review.tutorName());

    return Map.of(
        "message", "Review deleted successfully",
        "reviewId", review.id(),
        "tutorId", review.tutorId());
  }
// Shared guard: throws if the given user is not an Admin
  private void requireAdmin(UserRecord user) {
    if (!"Admin".equals(user.role())) {
      throw new ReviewNotAllowedException("Only admins can manage reviews");
    }
  }
// Converts a ReviewRecord (DB projection) into an ordered map suitable for JSON serialisation
  private Map<String, Object> toMap(ReviewRecord review) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", review.id());
    data.put("bookingId", review.bookingId());
    data.put("studentId", review.studentId());
    data.put("studentName", review.studentName());
    data.put("tutorId", review.tutorId());
    data.put("tutorName", review.tutorName());
    data.put("subject", review.subject());
    data.put("rating", review.rating());
    data.put("comment", review.comment() == null ? "" : review.comment());
    data.put("createdAt", review.createdAt());
    return data;
  }
}
