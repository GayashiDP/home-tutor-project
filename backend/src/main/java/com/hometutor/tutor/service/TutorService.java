package com.hometutor.tutor.service;

import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.SubjectRecord;
import com.hometutor.user.UserRepository.TutorRecord;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class TutorService {
  private final UserRepository userRepository;

  public TutorService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> getTutors(String name, String subject) {
    List<Map<String, Object>> tutors = userRepository.findTutors(name, subject).stream()
        .map(this::toTutorSummary)
        .toList();

    return Map.of(
        "tutors", tutors,
        "subjects", userRepository.findActiveSubjectNames(),
        "count", tutors.size());
  }

  public Map<String, Object> getTutor(String id) {
    TutorRecord tutor = userRepository.findTutorById(id)
        .orElseThrow(TutorNotFoundException::new);

    return Map.of("tutor", toTutorDetail(tutor));
  }

  private Map<String, Object> toTutorSummary(TutorRecord tutor) {
    return Map.of(
        "id", tutor.id(),
        "name", tutor.name(),
        "email", tutor.email(),
        "role", tutor.role(),
        "bio", tutor.bio() == null ? "" : tutor.bio(),
        "hourly_rate", hourlyRate(tutor.hourlyRate()),
        "rating", rating(tutor.rating()),
        "reviewCount", tutor.reviewCount(),
        "latestReview", latestReview(tutor),
        "subjects", subjectNames(tutor.id()));
  }

  private Map<String, Object> toTutorDetail(TutorRecord tutor) {
    return Map.of(
        "id", tutor.id(),
        "name", tutor.name(),
        "email", tutor.email(),
        "role", tutor.role(),
        "bio", tutor.bio() == null ? "" : tutor.bio(),
        "hourly_rate", hourlyRate(tutor.hourlyRate()),
        "rating", rating(tutor.rating()),
        "reviewCount", tutor.reviewCount(),
        "latestReview", latestReview(tutor),
        "subjects", subjects(tutor.id()));
  }

  private List<Map<String, Object>> subjectNames(String tutorId) {
    return userRepository.findSubjectNamesByTutorId(tutorId).stream()
        .map(subject -> Map.<String, Object>of("name", subject))
        .toList();
  }

  private List<Map<String, Object>> subjects(String tutorId) {
    return userRepository.findSubjectsByTutorId(tutorId).stream()
        .map(this::toSubject)
        .toList();
  }

  private Map<String, Object> toSubject(SubjectRecord subject) {
    return Map.of(
        "id", subject.id(),
        "name", subject.name(),
        "description", subject.description() == null ? "" : subject.description(),
        "grade_level", subject.gradeLevel() == null ? "" : subject.gradeLevel());
  }

  private BigDecimal hourlyRate(BigDecimal hourlyRate) {
    return hourlyRate == null ? BigDecimal.ZERO : hourlyRate;
  }

  private BigDecimal rating(BigDecimal rating) {
    return rating == null ? BigDecimal.ZERO : rating;
  }

  private Map<String, Object> latestReview(TutorRecord tutor) {
    if (tutor.reviewCount() <= 0) {
      return Map.of();
    }

    return Map.of(
        "studentName", tutor.latestReviewStudentName() == null ? "" : tutor.latestReviewStudentName(),
        "rating", tutor.latestReviewRating(),
        "comment", tutor.latestReviewComment() == null ? "" : tutor.latestReviewComment(),
        "createdAt", tutor.latestReviewCreatedAt() == null ? "" : tutor.latestReviewCreatedAt());
  }
}
