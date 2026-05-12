package com.hometutor.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final JdbcTemplate jdbcTemplate;

  public UserRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public boolean existsByEmail(String email) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM users WHERE email = ?",
        Integer.class,
        email);
    return count != null && count > 0;
  }

  public void create(String id, String name, String email, String passwordHash, String role) {
    jdbcTemplate.update(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (CAST(? AS uuid), ?, ?, ?, ?)",
        id,
        name,
        email,
        passwordHash,
        role);
  }

  public Optional<UserRecord> findByEmail(String email) {
    return jdbcTemplate.query(
        "SELECT id, name, email, password_hash, role, bio FROM users WHERE email = ?",
        (rs, rowNum) -> new UserRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("bio")),
        email)
        .stream()
        .findFirst();
  }

  public Optional<UserRecord> findById(String id) {
    return jdbcTemplate.query(
        "SELECT id, name, email, password_hash, role, bio FROM users WHERE id = CAST(? AS uuid)",
        (rs, rowNum) -> new UserRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("bio")),
        id)
        .stream()
        .findFirst();
  }

  public List<TutorRecord> findTutors(String name, String subject) {
    List<Object> params = new ArrayList<>();
    StringBuilder sql = new StringBuilder("""
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.bio, u.hourly_rate
        FROM users u
        LEFT JOIN subjects s ON s.tutor_id = u.id AND s.is_active = TRUE
        WHERE u.role = 'Tutor'
        """);

    if (name != null && !name.isBlank()) {
      sql.append(" AND LOWER(u.name) LIKE LOWER(?)");
      params.add("%" + name.trim() + "%");
    }

    if (subject != null && !subject.isBlank()) {
      sql.append(" AND LOWER(s.name) = LOWER(?)");
      params.add(subject.trim());
    }

    sql.append(" ORDER BY u.name");

    return jdbcTemplate.query(
        sql.toString(),
        (rs, rowNum) -> new TutorRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("bio"),
            rs.getBigDecimal("hourly_rate")),
        params.toArray());
  }

  public List<String> findActiveSubjectNames() {
    return jdbcTemplate.query(
        """
        SELECT DISTINCT name
        FROM subjects
        WHERE is_active = TRUE
        ORDER BY name
        """,
        (rs, rowNum) -> rs.getString("name"));
  }

  public Optional<TutorRecord> findTutorById(String id) {
    return jdbcTemplate.query(
        """
        SELECT id, name, email, role, bio, hourly_rate
        FROM users
        WHERE id = CAST(? AS uuid) AND role = 'Tutor'
        """,
        (rs, rowNum) -> new TutorRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("bio"),
            rs.getBigDecimal("hourly_rate")),
        id)
        .stream()
        .findFirst();
  }

  public void updateProfile(String id, String name, String bio) {
    jdbcTemplate.update(
        "UPDATE users SET name = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = CAST(? AS uuid)",
        name,
        bio,
        id);
  }

  public List<String> findSubjectNamesByTutorId(String tutorId) {
    return jdbcTemplate.query(
        "SELECT name FROM subjects WHERE tutor_id = CAST(? AS uuid) AND is_active = TRUE ORDER BY name",
        (rs, rowNum) -> rs.getString("name"),
        tutorId);
  }

  public List<SubjectRecord> findSubjectsByTutorId(String tutorId) {
    return jdbcTemplate.query(
        """
        SELECT id, name, description, grade_level
        FROM subjects
        WHERE tutor_id = CAST(? AS uuid) AND is_active = TRUE
        ORDER BY name
        """,
        (rs, rowNum) -> new SubjectRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("description"),
            rs.getString("grade_level")),
        tutorId);
  }

  public boolean activeSubjectExistsForTutor(String tutorId, String name) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM subjects
        WHERE tutor_id = CAST(? AS uuid)
          AND is_active = TRUE
          AND LOWER(name) = LOWER(?)
        """,
        Integer.class,
        tutorId,
        name);
    return count != null && count > 0;
  }

  public SubjectRecord createSubject(String tutorId, String name, String description, String gradeLevel) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO subjects (id, tutor_id, name, description, grade_level, is_active)
        VALUES (CAST(? AS uuid), CAST(? AS uuid), ?, ?, ?, TRUE)
        """,
        id,
        tutorId,
        name,
        description,
        gradeLevel);
    return new SubjectRecord(id, name, description, gradeLevel);
  }

  public boolean deactivateSubject(String tutorId, String subjectId) {
    int rows = jdbcTemplate.update(
        """
        UPDATE subjects
        SET is_active = FALSE
        WHERE id = CAST(? AS uuid)
          AND tutor_id = CAST(? AS uuid)
          AND is_active = TRUE
        """,
        subjectId,
        tutorId);
    return rows > 0;
  }

  public List<AvailabilitySlotRecord> findAvailabilityByTutorId(String tutorId) {
    return jdbcTemplate.query(
        """
        SELECT id, day_of_week, start_time::text, end_time::text, status
        FROM availability_slots
        WHERE tutor_id = CAST(? AS uuid)
        ORDER BY
          CASE day_of_week
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
            ELSE 8
          END,
          start_time
        """,
        (rs, rowNum) -> new AvailabilitySlotRecord(
            rs.getString("id"),
            rs.getString("day_of_week"),
            rs.getString("start_time"),
            rs.getString("end_time"),
            rs.getString("status")),
        tutorId);
  }

  public Optional<AvailabilitySlotRecord> findAvailabilitySlotForTutor(String tutorId, String slotId) {
    return jdbcTemplate.query(
        """
        SELECT id, day_of_week, start_time::text, end_time::text, status
        FROM availability_slots
        WHERE id = CAST(? AS uuid)
          AND tutor_id = CAST(? AS uuid)
        """,
        (rs, rowNum) -> new AvailabilitySlotRecord(
            rs.getString("id"),
            rs.getString("day_of_week"),
            rs.getString("start_time"),
            rs.getString("end_time"),
            rs.getString("status")),
        slotId,
        tutorId)
        .stream()
        .findFirst();
  }

  public List<String> findBookedSlotIdsByTutorId(String tutorId) {
    return jdbcTemplate.query(
        """
        SELECT DISTINCT slot_id::text
        FROM bookings
        WHERE tutor_id = CAST(? AS uuid)
          AND slot_id IS NOT NULL
          AND status IN ('Pending', 'Confirmed')
        """,
        (rs, rowNum) -> rs.getString("slot_id"),
        tutorId);
  }

  public boolean isAvailabilitySlotBooked(String slotId) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM bookings
        WHERE slot_id = CAST(? AS uuid)
          AND status IN ('Pending', 'Confirmed')
        """,
        Integer.class,
        slotId);
    return count != null && count > 0;
  }

  public boolean hasConfirmedBookingForSlot(String slotId) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM bookings
        WHERE slot_id = CAST(? AS uuid)
          AND status = 'Confirmed'
        """,
        Integer.class,
        slotId);
    return count != null && count > 0;
  }

  public boolean hasConfirmedBookingOverlap(
      String tutorId,
      String slotId,
      String dayOfWeek,
      String startTime,
      String endTime) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM bookings b
        JOIN availability_slots s ON s.id = b.slot_id
        WHERE b.tutor_id = CAST(? AS uuid)
          AND b.status = 'Confirmed'
          AND b.slot_id <> CAST(? AS uuid)
          AND s.day_of_week = ?
          AND s.start_time < CAST(? AS time)
          AND s.end_time > CAST(? AS time)
        """,
        Integer.class,
        tutorId,
        slotId,
        dayOfWeek,
        endTime,
        startTime);
    return count != null && count > 0;
  }

  public int countPendingBookingsForSlot(String slotId) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM bookings
        WHERE slot_id = CAST(? AS uuid)
          AND status = 'Pending'
        """,
        Integer.class,
        slotId);
    return count == null ? 0 : count;
  }

  public int notifyPendingBookingStudentsForSlot(String slotId, String message) {
    return jdbcTemplate.update(
        """
        INSERT INTO notifications (id, user_id, booking_id, message)
        SELECT gen_random_uuid(), b.student_id, b.id, ?
        FROM bookings b
        WHERE b.slot_id = CAST(? AS uuid)
          AND b.status = 'Pending'
        """,
        message,
        slotId);
  }

  public AvailabilitySlotRecord updateAvailabilitySlot(
      String tutorId,
      String slotId,
      String dayOfWeek,
      String startTime,
      String endTime,
      String status) {
    jdbcTemplate.update(
        """
        UPDATE availability_slots
        SET day_of_week = ?, start_time = CAST(? AS time), end_time = CAST(? AS time), status = ?
        WHERE id = CAST(? AS uuid)
          AND tutor_id = CAST(? AS uuid)
        """,
        dayOfWeek,
        startTime,
        endTime,
        status,
        slotId,
        tutorId);

    return findAvailabilitySlotForTutor(tutorId, slotId).orElseThrow();
  }

  public BookingRecord createBooking(
      String studentId,
      String tutorId,
      String slotId,
      String subject,
      String sessionDate,
      String note) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO bookings (id, student_id, tutor_id, slot_id, subject, status, session_date, note)
        VALUES (CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), ?, 'Pending', CAST(? AS date), ?)
        """,
        id,
        studentId,
        tutorId,
        slotId,
        subject,
        sessionDate,
        note);

    return new BookingRecord(id, studentId, tutorId, slotId, subject, "Pending", sessionDate);
  }

  public void replaceAvailabilitySlots(String tutorId, List<AvailabilitySlotRecord> slots) {
    jdbcTemplate.update("DELETE FROM availability_slots WHERE tutor_id = CAST(? AS uuid)", tutorId);

    for (AvailabilitySlotRecord slot : slots) {
      jdbcTemplate.update(
          """
          INSERT INTO availability_slots (id, tutor_id, day_of_week, start_time, end_time, status)
          VALUES (CAST(? AS uuid), CAST(? AS uuid), ?, CAST(? AS time), CAST(? AS time), ?)
          """,
          UUID.randomUUID().toString(),
          tutorId,
          slot.dayOfWeek(),
          slot.startTime(),
          slot.endTime(),
          slot.status());
    }
  }

  public void replaceTutorSubjects(String tutorId, List<String> subjects) {
    jdbcTemplate.update("DELETE FROM subjects WHERE tutor_id = CAST(? AS uuid)", tutorId);

    for (String subject : subjects) {
      jdbcTemplate.update(
          "INSERT INTO subjects (id, tutor_id, name, is_active) VALUES (CAST(? AS uuid), CAST(? AS uuid), ?, TRUE)",
          UUID.randomUUID().toString(),
          tutorId,
          subject);
    }
  }

  public record UserRecord(String id, String name, String email, String passwordHash, String role, String bio) {
  }

  public record TutorRecord(
      String id,
      String name,
      String email,
      String role,
      String bio,
      java.math.BigDecimal hourlyRate) {
  }

  public record SubjectRecord(String id, String name, String description, String gradeLevel) {
  }

  public record AvailabilitySlotRecord(
      String id,
      String dayOfWeek,
      String startTime,
      String endTime,
      String status) {
  }

  public record BookingRecord(
      String id,
      String studentId,
      String tutorId,
      String slotId,
      String subject,
      String status,
      String sessionDate) {
  }
}
