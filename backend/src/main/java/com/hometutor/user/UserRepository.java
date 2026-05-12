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

  public void upsertAdmin(String id, String name, String email, String passwordHash) {
    jdbcTemplate.update(
        """
        INSERT INTO users (id, name, email, password_hash, role, status)
        VALUES (CAST(? AS uuid), ?, ?, ?, 'Admin', 'Active')
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'Admin', status = 'Active'
        """,
        id,
        name,
        email,
        passwordHash);
  }

  public void allowAdminRole() {
    jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
    jdbcTemplate.execute(
        "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('Student', 'Tutor', 'Admin'))");
  }

  public Optional<UserRecord> findByEmail(String email) {
    return jdbcTemplate.query(
        "SELECT id, name, email, password_hash, role, bio, COALESCE(status, 'Active') AS status FROM users WHERE email = ?",
        (rs, rowNum) -> new UserRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("bio"),
            rs.getString("status")),
        email)
        .stream()
        .findFirst();
  }

  public Optional<UserRecord> findById(String id) {
    return jdbcTemplate.query(
        "SELECT id, name, email, password_hash, role, bio, COALESCE(status, 'Active') AS status FROM users WHERE id = CAST(? AS uuid)",
        (rs, rowNum) -> new UserRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("bio"),
            rs.getString("status")),
        id)
        .stream()
        .findFirst();
  }

  public List<TutorRecord> findTutors(String name, String subject) {
    List<Object> params = new ArrayList<>();
    StringBuilder sql = new StringBuilder("""
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.bio, u.hourly_rate, COALESCE(u.status, 'Active') AS status
        FROM users u
        LEFT JOIN subjects s ON s.tutor_id = u.id AND s.is_active = TRUE
        WHERE u.role = 'Tutor'
          AND COALESCE(u.status, 'Active') = 'Active'
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
            rs.getBigDecimal("hourly_rate"),
            rs.getString("status")),
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
        SELECT id, name, email, role, bio, hourly_rate, COALESCE(status, 'Active') AS status
        FROM users
        WHERE id = CAST(? AS uuid) AND role = 'Tutor'
          AND COALESCE(status, 'Active') = 'Active'
        """,
        (rs, rowNum) -> new TutorRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("bio"),
            rs.getBigDecimal("hourly_rate"),
            rs.getString("status")),
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

  public boolean updateSessionPriceForTutor(String tutorId, String bookingId, java.math.BigDecimal price) {
    int rows = jdbcTemplate.update(
        """
        UPDATE bookings
        SET session_price = ?
        WHERE id = CAST(? AS uuid)
          AND tutor_id = CAST(? AS uuid)
          AND status IN ('Pending', 'Confirmed')
        """,
        price,
        bookingId,
        tutorId);
    return rows > 0;
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
               COALESCE(b.session_price, tutor_user.hourly_rate) AS hourly_rate,
               b.session_price AS session_price,
               payment.id::text AS payment_id,
               COALESCE(payment.status, '') AS payment_status,
               COALESCE(payment.slip_file_name, '') AS slip_file_name,
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
        LEFT JOIN LATERAL (
          SELECT p.id, p.status, p.slip_file_name
          FROM payments p
          WHERE p.booking_id = b.id
          ORDER BY p.created_at DESC
          LIMIT 1
        ) payment ON TRUE
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
               COALESCE(b.session_price, tutor_user.hourly_rate) AS hourly_rate,
               b.session_price AS session_price,
               payment.id::text AS payment_id,
               COALESCE(payment.status, '') AS payment_status,
               COALESCE(payment.slip_file_name, '') AS slip_file_name,
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
        LEFT JOIN LATERAL (
          SELECT p.id, p.status, p.slip_file_name
          FROM payments p
          WHERE p.booking_id = b.id
          ORDER BY p.created_at DESC
          LIMIT 1
        ) payment ON TRUE
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
               r.tutor_id::text, tutor_user.name AS tutor_name, COALESCE(b.subject, '') AS subject,
               r.rating, COALESCE(r.comment, '') AS comment, r.created_at::text
        FROM reviews r
        JOIN users student_user ON student_user.id = r.student_id
        JOIN users tutor_user ON tutor_user.id = r.tutor_id
        LEFT JOIN bookings b ON b.id = r.booking_id
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
               r.tutor_id::text, tutor_user.name AS tutor_name, COALESCE(b.subject, '') AS subject,
               r.rating, COALESCE(r.comment, '') AS comment, r.created_at::text
        FROM reviews r
        JOIN users student_user ON student_user.id = r.student_id
        JOIN users tutor_user ON tutor_user.id = r.tutor_id
        LEFT JOIN bookings b ON b.id = r.booking_id
        WHERE r.tutor_id = CAST(? AS uuid)
        ORDER BY r.created_at DESC
        """,
        this::mapReviewRecord,
        tutorId);
  }

  public List<ReviewRecord> findAllReviewsForAdmin() {
    return jdbcTemplate.query(
        """
        SELECT r.id, r.booking_id::text, r.student_id::text, student_user.name AS student_name,
               r.tutor_id::text, tutor_user.name AS tutor_name, COALESCE(b.subject, '') AS subject,
               r.rating, COALESCE(r.comment, '') AS comment, r.created_at::text
        FROM reviews r
        JOIN users student_user ON student_user.id = r.student_id
        JOIN users tutor_user ON tutor_user.id = r.tutor_id
        LEFT JOIN bookings b ON b.id = r.booking_id
        ORDER BY r.created_at DESC
        """,
        this::mapReviewRecord);
  }

  public boolean deleteReviewById(String reviewId) {
    int rows = jdbcTemplate.update("DELETE FROM reviews WHERE id = CAST(? AS uuid)", reviewId);
    return rows > 0;
  }

  public void createAuditLog(String actorId, String action, String entityType, String entityId, String details) {
    jdbcTemplate.update(
        """
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details)
        VALUES (gen_random_uuid(), CAST(? AS uuid), ?, ?, CAST(? AS uuid), ?)
        """,
        actorId,
        action,
        entityType,
        entityId,
        details);
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

  public PaymentRecord createSlipPayment(
      String bookingId,
      String studentId,
      java.math.BigDecimal amount,
      String receiptNo,
      String slipFileName,
      String slipContentType,
      byte[] slipData) {
    String id = UUID.randomUUID().toString();
    jdbcTemplate.update(
        """
        INSERT INTO payments (
          id, booking_id, student_id, amount, status, receipt_no,
          slip_file_name, slip_content_type, slip_data, slip_uploaded_at
        )
        VALUES (
          CAST(? AS uuid), CAST(? AS uuid), CAST(? AS uuid), ?, 'PendingApproval', ?,
          ?, ?, ?, CURRENT_TIMESTAMP
        )
        """,
        id,
        bookingId,
        studentId,
        amount,
        receiptNo,
        slipFileName,
        slipContentType,
        slipData);

    return findPaymentById(id).orElseThrow();
  }

  public Optional<PaymentRecord> findPaymentById(String paymentId) {
    return jdbcTemplate.query(
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
        paymentId)
        .stream()
        .findFirst();
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

  public List<PaymentApprovalRecord> findPendingSlipPaymentsForAdmin() {
    return jdbcTemplate.query(
        """
        SELECT p.id::text, p.booking_id::text, p.student_id::text, p.amount, p.status,
               p.receipt_no, p.created_at::text, COALESCE(p.slip_uploaded_at::text, '') AS slip_uploaded_at,
               COALESCE(p.slip_file_name, '') AS slip_file_name,
               COALESCE(p.slip_content_type, '') AS slip_content_type,
               b.subject, b.session_date::text, b.status AS booking_status,
               COALESCE(s.start_time::text, '') AS start_time,
               COALESCE(s.end_time::text, '') AS end_time,
               student_user.name AS student_name,
               tutor_user.name AS tutor_name
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        JOIN users student_user ON student_user.id = b.student_id
        JOIN users tutor_user ON tutor_user.id = b.tutor_id
        LEFT JOIN availability_slots s ON s.id = b.slot_id
        WHERE p.status = 'PendingApproval'
        ORDER BY COALESCE(p.slip_uploaded_at, p.created_at) DESC
        """,
        this::mapPaymentApprovalRecord);
  }

  public Optional<PaymentApprovalRecord> findPaymentApprovalById(String paymentId) {
    return jdbcTemplate.query(
        """
        SELECT p.id::text, p.booking_id::text, p.student_id::text, p.amount, p.status,
               p.receipt_no, p.created_at::text, COALESCE(p.slip_uploaded_at::text, '') AS slip_uploaded_at,
               COALESCE(p.slip_file_name, '') AS slip_file_name,
               COALESCE(p.slip_content_type, '') AS slip_content_type,
               b.subject, b.session_date::text, b.status AS booking_status,
               COALESCE(s.start_time::text, '') AS start_time,
               COALESCE(s.end_time::text, '') AS end_time,
               student_user.name AS student_name,
               tutor_user.name AS tutor_name
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        JOIN users student_user ON student_user.id = b.student_id
        JOIN users tutor_user ON tutor_user.id = b.tutor_id
        LEFT JOIN availability_slots s ON s.id = b.slot_id
        WHERE p.id = CAST(? AS uuid)
        """,
        this::mapPaymentApprovalRecord,
        paymentId)
        .stream()
        .findFirst();
  }

  public Optional<PaymentSlipRecord> findPaymentSlipById(String paymentId) {
    return jdbcTemplate.query(
        """
        SELECT id::text, COALESCE(slip_file_name, 'payment-slip') AS slip_file_name,
               COALESCE(slip_content_type, 'application/octet-stream') AS slip_content_type,
               slip_data
        FROM payments
        WHERE id = CAST(? AS uuid)
          AND slip_data IS NOT NULL
        """,
        (rs, rowNum) -> new PaymentSlipRecord(
            rs.getString("id"),
            rs.getString("slip_file_name"),
            rs.getString("slip_content_type"),
            rs.getBytes("slip_data")),
        paymentId)
        .stream()
        .findFirst();
  }

  public boolean approveSlipPayment(String paymentId, String adminId) {
    int rows = jdbcTemplate.update(
        """
        UPDATE payments
        SET status = 'Completed',
            paid_at = CURRENT_TIMESTAMP,
            approved_by = CAST(? AS uuid),
            approved_at = CURRENT_TIMESTAMP
        WHERE id = CAST(? AS uuid)
          AND status = 'PendingApproval'
        """,
        adminId,
        paymentId);
    return rows > 0;
  }

  public boolean rejectSlipPayment(String paymentId, String adminId) {
    int rows = jdbcTemplate.update(
        """
        UPDATE payments
        SET status = 'Rejected',
            approved_by = CAST(? AS uuid),
            approved_at = CURRENT_TIMESTAMP
        WHERE id = CAST(? AS uuid)
          AND status = 'PendingApproval'
        """,
        adminId,
        paymentId);
    return rows > 0;
  }

  public List<AdminStudentRecord> findStudentsForAdmin() {
    return jdbcTemplate.query(
        """
        SELECT u.id::text, u.name, u.email, COALESCE(u.bio, '') AS bio,
               COALESCE(u.status, 'Active') AS status, u.created_at::text,
               COALESCE(bs.session_count, 0) AS session_count,
               COALESCE(bs.completed_sessions, 0) AS completed_sessions,
               COALESCE(ps.total_spent, 0) AS total_spent
        FROM users u
        LEFT JOIN (
          SELECT student_id, COUNT(*) AS session_count,
                 COUNT(*) FILTER (WHERE status = 'Completed') AS completed_sessions
          FROM bookings
          GROUP BY student_id
        ) bs ON bs.student_id = u.id
        LEFT JOIN (
          SELECT student_id, COALESCE(SUM(amount), 0) AS total_spent
          FROM payments
          WHERE status IN ('Completed', 'Paid')
          GROUP BY student_id
        ) ps ON ps.student_id = u.id
        WHERE u.role = 'Student'
        ORDER BY u.name
        """,
        (rs, rowNum) -> new AdminStudentRecord(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("bio"),
            rs.getString("status"),
            rs.getString("created_at"),
            rs.getInt("session_count"),
            rs.getInt("completed_sessions"),
            rs.getBigDecimal("total_spent")));
  }

  public List<AdminTutorRecord> findTutorsForAdmin() {
    return jdbcTemplate.query(
        """
        SELECT u.id::text, u.name, u.email, COALESCE(u.bio, '') AS bio,
               u.hourly_rate, COALESCE(u.status, 'Active') AS status, u.created_at::text,
               COALESCE(ss.subject_count, 0) AS subject_count,
               COALESCE(av.slot_count, 0) AS slot_count,
               COALESCE(bs.session_count, 0) AS session_count,
               COALESCE(bs.completed_sessions, 0) AS completed_sessions,
               COALESCE(es.total_earned, 0) AS total_earned
        FROM users u
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) AS subject_count
          FROM subjects
          WHERE is_active = TRUE
          GROUP BY tutor_id
        ) ss ON ss.tutor_id = u.id
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) FILTER (WHERE status <> 'cancelled') AS slot_count
          FROM availability_slots
          GROUP BY tutor_id
        ) av ON av.tutor_id = u.id
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) AS session_count,
                 COUNT(*) FILTER (WHERE status = 'Completed') AS completed_sessions
          FROM bookings
          GROUP BY tutor_id
        ) bs ON bs.tutor_id = u.id
        LEFT JOIN (
          SELECT b.tutor_id, COALESCE(SUM(p.amount), 0) AS total_earned
          FROM bookings b
          JOIN payments p ON p.booking_id = b.id
          WHERE p.status IN ('Completed', 'Paid')
          GROUP BY b.tutor_id
        ) es ON es.tutor_id = u.id
        WHERE u.role = 'Tutor'
        ORDER BY
          CASE COALESCE(u.status, 'Active') WHEN 'Suspended' THEN 1 ELSE 0 END,
          u.name
        """,
        this::mapAdminTutorRecord);
  }

  public Optional<AdminTutorRecord> findTutorForAdmin(String tutorId) {
    return jdbcTemplate.query(
        """
        SELECT u.id::text, u.name, u.email, COALESCE(u.bio, '') AS bio,
               u.hourly_rate, COALESCE(u.status, 'Active') AS status, u.created_at::text,
               COALESCE(ss.subject_count, 0) AS subject_count,
               COALESCE(av.slot_count, 0) AS slot_count,
               COALESCE(bs.session_count, 0) AS session_count,
               COALESCE(bs.completed_sessions, 0) AS completed_sessions,
               COALESCE(es.total_earned, 0) AS total_earned
        FROM users u
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) AS subject_count
          FROM subjects
          WHERE is_active = TRUE
          GROUP BY tutor_id
        ) ss ON ss.tutor_id = u.id
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) FILTER (WHERE status <> 'cancelled') AS slot_count
          FROM availability_slots
          GROUP BY tutor_id
        ) av ON av.tutor_id = u.id
        LEFT JOIN (
          SELECT tutor_id, COUNT(*) AS session_count,
                 COUNT(*) FILTER (WHERE status = 'Completed') AS completed_sessions
          FROM bookings
          GROUP BY tutor_id
        ) bs ON bs.tutor_id = u.id
        LEFT JOIN (
          SELECT b.tutor_id, COALESCE(SUM(p.amount), 0) AS total_earned
          FROM bookings b
          JOIN payments p ON p.booking_id = b.id
          WHERE p.status IN ('Completed', 'Paid')
          GROUP BY b.tutor_id
        ) es ON es.tutor_id = u.id
        WHERE u.id = CAST(? AS uuid)
          AND u.role = 'Tutor'
        """,
        this::mapAdminTutorRecord,
        tutorId)
        .stream()
        .findFirst();
  }

  public boolean updateTutorStatus(String tutorId, String status) {
    int rows = jdbcTemplate.update(
        """
        UPDATE users
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = CAST(? AS uuid)
          AND role = 'Tutor'
        """,
        status,
        tutorId);
    return rows > 0;
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
        rs.getBigDecimal("session_price"),
        rs.getString("payment_id"),
        rs.getString("payment_status"),
        rs.getString("slip_file_name"),
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
        rs.getString("tutor_name"),
        rs.getString("subject"),
        rs.getInt("rating"),
        rs.getString("comment"),
        rs.getString("created_at"));
  }

  private AdminTutorRecord mapAdminTutorRecord(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
    return new AdminTutorRecord(
        rs.getString("id"),
        rs.getString("name"),
        rs.getString("email"),
        rs.getString("bio"),
        rs.getBigDecimal("hourly_rate"),
        rs.getString("status"),
        rs.getString("created_at"),
        rs.getInt("subject_count"),
        rs.getInt("slot_count"),
        rs.getInt("session_count"),
        rs.getInt("completed_sessions"),
        rs.getBigDecimal("total_earned"));
  }

  private PaymentApprovalRecord mapPaymentApprovalRecord(
      java.sql.ResultSet rs,
      int rowNum) throws java.sql.SQLException {
    return new PaymentApprovalRecord(
        rs.getString("id"),
        rs.getString("booking_id"),
        rs.getString("student_id"),
        rs.getBigDecimal("amount"),
        rs.getString("status"),
        rs.getString("receipt_no"),
        rs.getString("created_at"),
        rs.getString("slip_uploaded_at"),
        rs.getString("slip_file_name"),
        rs.getString("slip_content_type"),
        rs.getString("subject"),
        rs.getString("session_date"),
        rs.getString("start_time"),
        rs.getString("end_time"),
        rs.getString("student_name"),
        rs.getString("tutor_name"),
        rs.getString("booking_status"));
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

  public record UserRecord(
      String id,
      String name,
      String email,
      String passwordHash,
      String role,
      String bio,
      String status) {
  }

  public record TutorRecord(
      String id,
      String name,
      String email,
      String role,
      String bio,
      java.math.BigDecimal hourlyRate,
      String status) {
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
      java.math.BigDecimal sessionPrice,
      String paymentId,
      String paymentStatus,
      String slipFileName,
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
      String tutorName,
      String subject,
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

  public record PaymentApprovalRecord(
      String id,
      String bookingId,
      String studentId,
      java.math.BigDecimal amount,
      String status,
      String receiptNo,
      String createdAt,
      String slipUploadedAt,
      String slipFileName,
      String slipContentType,
      String subject,
      String sessionDate,
      String startTime,
      String endTime,
      String studentName,
      String tutorName,
      String bookingStatus) {
  }

  public record PaymentSlipRecord(
      String id,
      String fileName,
      String contentType,
      byte[] data) {
  }

  public record AdminStudentRecord(
      String id,
      String name,
      String email,
      String bio,
      String status,
      String createdAt,
      int sessionCount,
      int completedSessions,
      java.math.BigDecimal totalSpent) {
  }

  public record AdminTutorRecord(
      String id,
      String name,
      String email,
      String bio,
      java.math.BigDecimal hourlyRate,
      String status,
      String createdAt,
      int subjectCount,
      int slotCount,
      int sessionCount,
      int completedSessions,
      java.math.BigDecimal totalEarned) {
  }
}
