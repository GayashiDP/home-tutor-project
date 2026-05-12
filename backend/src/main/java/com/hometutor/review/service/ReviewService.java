package com.hometutor.review.service;

import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.review.dto.CreateReviewRequest;
import com.hometutor.review.exception.DuplicateReviewException;
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

@Service
public class ReviewService {
  private final UserRepository userRepository;

  public ReviewService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

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

  private Map<String, Object> toMap(ReviewRecord review) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", review.id());
    data.put("bookingId", review.bookingId());
    data.put("studentId", review.studentId());
    data.put("studentName", review.studentName());
    data.put("tutorId", review.tutorId());
    data.put("rating", review.rating());
    data.put("comment", review.comment() == null ? "" : review.comment());
    data.put("createdAt", review.createdAt());
    return data;
  }
}
