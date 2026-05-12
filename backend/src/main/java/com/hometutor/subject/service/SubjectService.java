package com.hometutor.subject.service;

import com.hometutor.auth.exception.AccountSuspendedException;
import com.hometutor.subject.dto.CreateSubjectRequest;
import com.hometutor.subject.exception.DuplicateSubjectException;
import com.hometutor.subject.exception.SubjectNotFoundException;
import com.hometutor.subject.exception.TutorOnlySubjectException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.SubjectRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SubjectService {
  private final UserRepository userRepository;

  public SubjectService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> getMySubjects(String userId) {
    UserRecord tutor = requireTutor(userId);
    return Map.of("subjects", subjects(tutor.id()));
  }

  public Map<String, Object> createSubject(String userId, CreateSubjectRequest request) {
    UserRecord tutor = requireTutor(userId);
    String name = request.getName().trim();
    String description = request.getDescription() == null ? "" : request.getDescription().trim();
    String gradeLevel = request.getGradeLevel() == null ? "" : request.getGradeLevel().trim();

    if (userRepository.activeSubjectExistsForTutor(tutor.id(), name)) {
      throw new DuplicateSubjectException();
    }

    SubjectRecord subject = userRepository.createSubject(tutor.id(), name, description, gradeLevel);
    return Map.of("message", "Subject added successfully", "subject", toSubject(subject));
  }

  public Map<String, String> deleteSubject(String userId, String subjectId) {
    UserRecord tutor = requireTutor(userId);

    if (!userRepository.deactivateSubject(tutor.id(), subjectId)) {
      throw new SubjectNotFoundException();
    }

    return Map.of("message", "Subject removed successfully");
  }

  private UserRecord requireTutor(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(TutorOnlySubjectException::new);

    if (!"Tutor".equals(user.role())) {
      throw new TutorOnlySubjectException();
    }

    if ("Suspended".equals(user.status())) {
      throw new AccountSuspendedException();
    }

    return user;
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
        "gradeLevel", subject.gradeLevel() == null ? "" : subject.gradeLevel());
  }
}
