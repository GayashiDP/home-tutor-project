package com.hometutor.admin.service;

import com.hometutor.admin.exception.AdminAccessException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.AdminStudentRecord;
import com.hometutor.user.UserRepository.AdminTutorRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
  private final UserRepository userRepository;

  public AdminService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> getUsers(String userId) {
    requireAdmin(userId);

    List<AdminStudentRecord> students = userRepository.findStudentsForAdmin();
    List<AdminTutorRecord> tutors = userRepository.findTutorsForAdmin();

    return Map.of(
        "students", students.stream().map(this::studentToMap).toList(),
        "tutors", tutors.stream().map(this::tutorToMap).toList(),
        "stats", stats(students, tutors));
  }

  @Transactional
  public Map<String, Object> suspendTutor(String userId, String tutorId) {
    UserRecord admin = requireAdmin(userId);
    return updateTutorStatus(admin, tutorId, "Suspended", "SUSPEND_TUTOR", "Tutor suspended");
  }

  @Transactional
  public Map<String, Object> activateTutor(String userId, String tutorId) {
    UserRecord admin = requireAdmin(userId);
    return updateTutorStatus(admin, tutorId, "Active", "ACTIVATE_TUTOR", "Tutor reactivated");
  }

  private Map<String, Object> updateTutorStatus(
      UserRecord admin,
      String tutorId,
      String status,
      String action,
      String message) {
    if (!userRepository.updateTutorStatus(tutorId, status)) {
      throw new TutorNotFoundException();
    }

    AdminTutorRecord tutor = userRepository.findTutorForAdmin(tutorId)
        .orElseThrow(TutorNotFoundException::new);
    userRepository.createAuditLog(admin.id(), action, "users", tutor.id(), message + ": " + tutor.email());

    return Map.of(
        "message", message,
        "tutor", tutorToMap(tutor));
  }

  private UserRecord requireAdmin(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(() -> new AdminAccessException("Only admins can manage users"));

    if (!"Admin".equals(user.role())) {
      throw new AdminAccessException("Only admins can manage users");
    }

    return user;
  }

  private Map<String, Object> stats(List<AdminStudentRecord> students, List<AdminTutorRecord> tutors) {
    BigDecimal totalSpent = students.stream()
        .map(student -> amount(student.totalSpent()))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalEarned = tutors.stream()
        .map(tutor -> amount(tutor.totalEarned()))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    long suspendedTutors = tutors.stream()
        .filter(tutor -> "Suspended".equals(tutor.status()))
        .count();

    return Map.of(
        "students", students.size(),
        "tutors", tutors.size(),
        "suspendedTutors", suspendedTutors,
        "totalStudentSpend", totalSpent,
        "totalTutorEarnings", totalEarned);
  }

  private Map<String, Object> studentToMap(AdminStudentRecord student) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", student.id());
    data.put("name", student.name());
    data.put("email", student.email());
    data.put("bio", student.bio());
    data.put("status", student.status());
    data.put("createdAt", student.createdAt());
    data.put("sessionCount", student.sessionCount());
    data.put("completedSessions", student.completedSessions());
    data.put("totalSpent", amount(student.totalSpent()));
    return data;
  }

  private Map<String, Object> tutorToMap(AdminTutorRecord tutor) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", tutor.id());
    data.put("name", tutor.name());
    data.put("email", tutor.email());
    data.put("bio", tutor.bio());
    data.put("hourlyRate", amount(tutor.hourlyRate()));
    data.put("status", tutor.status());
    data.put("createdAt", tutor.createdAt());
    data.put("subjectCount", tutor.subjectCount());
    data.put("slotCount", tutor.slotCount());
    data.put("sessionCount", tutor.sessionCount());
    data.put("completedSessions", tutor.completedSessions());
    data.put("totalEarned", amount(tutor.totalEarned()));
    return data;
  }

  private BigDecimal amount(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }
}
