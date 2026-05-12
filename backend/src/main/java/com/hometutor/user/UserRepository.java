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

  public List<SessionRecord> findSessionsByUser(String userId, String role) {
    String participantJoin = "Tutor".equals(role)
        ? "JOIN users other_user ON other_user.id = b.student_id"
        : "JOIN users other_user ON other_user.id = b.tutor_id";
    String userColumn = "Tutor".equals(role) ? "b.tutor_id" : "b.student_id";

    return jdbcTemplate.query(
        """
        SELECT b.id, b.subject, b.status, b.session_date::text, COALESCE(b.note, '') AS note,
               COALESCE(s.day_of_week, '') AS day_of_week,
               COALESCE(s.start_time::text, '') AS start_time,
               COALESCE(s.end_time::text, '') AS end_time,
               b.student_id::text AS student_id,
               student_user.name AS student_name,
               b.tutor_id::text AS tutor_id,
               tutor_user.name AS tutor_name,
               tutor_user.hourly_rate AS hourly_rate,
               other_user.name AS participant_name,
               EXISTS (
                 SELECT 1
                 FROM reviews r
                 WHERE r.booking_id = b.id
                   AND r.student_id = b.student_id
               ) AS reviewed
        FROM bookings b
        LEFT JOIN availability_slots s ON s.id = b.slot_id
        JOIN users student_user ON student_user.id = b.student_id
        JOIN users tutor_user ON tutor_user.id = b.tutor_id
        %s
        WHERE %s = CAST(? AS uuid)
        ORDER BY b.session_date DESC, s.start_time DESC NULLS LAST
        """.formatted(participantJoin, userColumn),
        this::mapSessionRecord,
        userId);
  }

  public Optional<SessionRecord> findSessionByIdForUser(String userId, String role, String bookingId) {
    String participantJoin = "Tutor".equals(role)
        ? "JOIN users other_user ON other_user.id = b.student_id"
        : "JOIN users other_user ON other_user.id = b.tutor_id";
    String userColumn = "Tutor".equals(role) ? "b.tutor_id" : "b.student_id";

    return jdbcTemplate.query(
        """
        SELECT b.id, b.subject, b.status, b.session_date::text, COALESCE(b.note, '') AS note,
               COALESCE(s.day_of_week, '') AS day_of_week,
               COALESCE(s.start_time::text, '') AS start_time,
               COALESCE(s.end_time::text, '') AS end_time,
               b.student_id::text AS student_id,
               student_user.name AS student_name,
               b.tutor_id::text AS tutor_id,
               tutor_user.name AS tutor_name,
               tutor_user.hourly_rate AS hourly_rate,
               other_user.name AS participant_name,
               EXISTS (
                 SELECT 1
                 FROM reviews r
                 WHERE r.booking_id = b.id
                   AND r.student_id = b.student_id
               ) AS reviewed
        FROM bookings b
        LEFT JOIN availability_slots s ON s.id = b.slot_id
        JOIN users student_user ON student_user.id = b.student_id
        JOIN users tutor_user ON tutor_user.id = b.tutor_id
        %s
        WHERE b.id = CAST(? AS uuid)
          AND %s = CAST(? AS uuid)
        """.formatted(participantJoin, userColumn),
        this::mapSessionRecord,
        bookingId,
        userId)
        .stream()
        .findFirst();
  }

  public Optional<SessionRecord> findSessionByIdForStudent(String studentId, String bookingId) {
    return findSessionByIdForUser(studentId, "Student", bookingId);
  }

  public boolean reviewExistsForBookingAndStudent(String bookingId, String studentId) {
    Integer count = jdbcTemplate.queryForObject(
        """
        SELECT COUNT(*)
        FROM reviews
        WHERE booking_id = CAST(? AS uuid)
          AND student_id = CAST(? AS uuid)
        """,
        Integer.class,
        bookingId,
        studentId);
    return count != null && count > 0;
  }

  public ReviewRecord createReview(String bookingId, String studentId, String tutorId, int rating, String comment) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO reviews (id, booking_id, student_id, tutor_id, rating, comment)
        VALUES (CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), ?, ?)
        """,
        id,
        bookingId,
        studentId,
        tutorId,
        rating,
        comment);

    return findReviewById(id).orElseThrow();
  }

  public Optional<ReviewRecord> findReviewById(String id) {
    return jdbcTemplate.query(
        """
        SELECT r.id, r.booking_id::text, r.student_id::text, student_user.name AS student_name,
               r.tutor_id::text, r.rating, COALESCE(r.comment, '') AS comment, r.created_at::text
        FROM reviews r
        JOIN users student_user ON student_user.id = r.student_id
        WHERE r.id = CAST(? AS uuid)
        """,
        this::mapReviewRecord,
        id)
        .stream()
        .findFirst();
  }

  public List<ReviewRecord> findReviewsByTutorId(String tutorId) {
    return jdbcTemplate.query(
        """
        SELECT r.id, r.booking_id::text, r.student_id::text, student_user.name AS student_name,
               r.tutor_id::text, r.rating, COALESCE(r.comment, '') AS comment, r.created_at::text
        FROM reviews r
        JOIN users student_user ON student_user.id = r.student_id
        WHERE r.tutor_id = CAST(? AS uuid)
        ORDER BY r.created_at DESC
        """,
        this::mapReviewRecord,
        tutorId);
  }

  public boolean updateBookingStatus(String bookingId, String status) {
    int rows = jdbcTemplate.update(
        """
        UPDATE bookings
        SET status = ?
        WHERE id = CAST(? AS uuid)
        """,
        status,
        bookingId);
    return rows > 0;
  }

  public PaymentRecord createPayment(
      String bookingId,
      String studentId,
      java.math.BigDecimal amount,
      String status,
      String receiptNo) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO payments (id, booking_id, student_id, amount, status, receipt_no, paid_at)
        VALUES (CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        id,
        bookingId,
        studentId,
        amount,
        status,
        receiptNo);

    return jdbcTemplate.queryForObject(
        """
        SELECT id, booking_id::text, student_id::text, amount, status, receipt_no, paid_at::text
        FROM payments
        WHERE id = CAST(? AS uuid)
        """,
        (rs, rowNum) -> new PaymentRecord(
            rs.getString("id"),
            rs.getString("booking_id"),
            rs.getString("student_id"),
            rs.getBigDecimal("amount"),
            rs.getString("status"),
            rs.getString("receipt_no"),
            rs.getString("paid_at")),
        id);
  }

  public ReceiptRecord createReceipt(
      String bookingId,
      String paymentId,
      String receiptNo,
      java.math.BigDecimal amount) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO receipts (id, booking_id, payment_id, receipt_no, amount)
        VALUES (CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), ?, ?)
        """,
        id,
        bookingId,
        paymentId,
        receiptNo,
        amount);

    return jdbcTemplate.queryForObject(
        """
        SELECT id, booking_id::text, payment_id::text, receipt_no, amount, issued_at::text
        FROM receipts
        WHERE id = CAST(? AS uuid)
        """,
        (rs, rowNum) -> new ReceiptRecord(
            rs.getString("id"),
            rs.getString("booking_id"),
            rs.getString("payment_id"),
            rs.getString("receipt_no"),
            rs.getBigDecimal("amount"),
            rs.getString("issued_at")),
        id);
  }

  public List<TransactionRecord> findPaymentsByStudentId(String studentId) {
    return jdbcTemplate.query(
        """
        SELECT p.id, p.booking_id::text, p.student_id::text, p.amount, p.status, p.receipt_no,
               p.paid_at::text, p.created_at::text,
               b.subject, b.session_date::text, b.status AS booking_status,
               COALESCE(s.start_time::text, '') AS start_time,
               COALESCE(s.end_time::text, '') AS end_time,
               tutor_user.name AS tutor_name,
               student_user.name AS student_name,
               COALESCE(r.id::text, '') AS receipt_id,
               COALESCE(r.receipt_no, p.receipt_no, '') AS generated_receipt_no,
               COALESCE(r.issued_at::text, '') AS issued_at
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        JOIN users student_user ON student_user.id = b.student_id
        JOIN users tutor_user ON tutor_user.id = b.tutor_id
        LEFT JOIN availability_slots s ON s.id = b.slot_id
        LEFT JOIN receipts r ON r.payment_id = p.id
        WHERE p.student_id = CAST(? AS uuid)
        ORDER BY COALESCE(p.paid_at, p.created_at) DESC
        """,
        (rs, rowNum) -> new TransactionRecord(
            rs.getString("id"),
            rs.getString("booking_id"),
            rs.getString("student_id"),
            rs.getBigDecimal("amount"),
            rs.getString("status"),
            rs.getString("receipt_no"),
            rs.getString("paid_at"),
            rs.getString("created_at"),
            rs.getString("subject"),
            rs.getString("session_date"),
            rs.getString("start_time"),
            rs.getString("end_time"),
            rs.getString("tutor_name"),
            rs.getString("student_name"),
            rs.getString("booking_status"),
            rs.getString("receipt_id"),
            rs.getString("generated_receipt_no"),
            rs.getString("issued_at")),
        studentId);
  }

  private SessionRecord mapSessionRecord(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
    return new SessionRecord(
        rs.getString("id"),
        rs.getString("participant_name"),
        rs.getString("student_id"),
        rs.getString("student_name"),
        rs.getString("tutor_id"),
        rs.getString("tutor_name"),
        rs.getBigDecimal("hourly_rate"),
        rs.getString("subject"),
        rs.getString("status"),
        rs.getString("session_date"),
        rs.getString("day_of_week"),
        rs.getString("start_time"),
        rs.getString("end_time"),
        rs.getString("note"),
        rs.getBoolean("reviewed"));
  }

  private ReviewRecord mapReviewRecord(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
    return new ReviewRecord(
        rs.getString("id"),
        rs.getString("booking_id"),
        rs.getString("student_id"),
        rs.getString("student_name"),
        rs.getString("tutor_id"),
        rs.getInt("rating"),
        rs.getString("comment"),
        rs.getString("created_at"));
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

  public record SessionRecord(
      String id,
      String participantName,
      String studentId,
      String studentName,
      String tutorId,
      String tutorName,
      java.math.BigDecimal hourlyRate,
      String subject,
      String status,
      String sessionDate,
      String dayOfWeek,
      String startTime,
      String endTime,
      String note,
      boolean reviewed) {
  }

  public record ReviewRecord(
      String id,
      String bookingId,
      String studentId,
      String studentName,
      String tutorId,
      int rating,
      String comment,
      String createdAt) {
  }

  public record PaymentRecord(
      String id,
      String bookingId,
      String studentId,
      java.math.BigDecimal amount,
      String status,
      String receiptNo,
      String paidAt) {
  }

  public record ReceiptRecord(
      String id,
      String bookingId,
      String paymentId,
      String receiptNo,
      java.math.BigDecimal amount,
      String issuedAt) {
  }

  public record TransactionRecord(
      String id,
      String bookingId,
      String studentId,
      java.math.BigDecimal amount,
      String status,
      String receiptNo,
      String paidAt,
      String createdAt,
      String subject,
      String sessionDate,
      String startTime,
      String endTime,
      String tutorName,
      String studentName,
      String bookingStatus,
      String receiptId,
      String generatedReceiptNo,
      String issuedAt) {
  }
}
