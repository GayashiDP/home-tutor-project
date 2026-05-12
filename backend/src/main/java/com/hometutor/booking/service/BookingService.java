package com.hometutor.booking.service;

import com.hometutor.booking.dto.CreateBookingRequest;
import com.hometutor.booking.dto.SetSessionPriceRequest;
import com.hometutor.booking.exception.BookingCancellationException;
import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.booking.exception.SlotUnavailableException;
import com.hometutor.booking.exception.StudentOnlyBookingException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.AvailabilitySlotRecord;
import com.hometutor.user.UserRepository.BookingRecord;
import com.hometutor.user.UserRepository.SessionRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {
  private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
  private final UserRepository userRepository;

  public BookingService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> createBooking(String studentId, CreateBookingRequest request) {
    UserRecord student = userRepository.findById(studentId)
        .orElseThrow(StudentOnlyBookingException::new);

    if (!"Student".equals(student.role())) {
      throw new StudentOnlyBookingException();
    }

    if (userRepository.findTutorById(request.getTutorId()).isEmpty()) {
      throw new TutorNotFoundException();
    }

    AvailabilitySlotRecord slot = userRepository
        .findAvailabilitySlotForTutor(request.getTutorId(), request.getSlotId())
        .filter(candidate -> "available".equalsIgnoreCase(candidate.status()))
        .orElseThrow(SlotUnavailableException::new);

    if (userRepository.isAvailabilitySlotBooked(request.getSlotId())) {
      throw new SlotUnavailableException();
    }

    String subject = request.getSubject() == null || request.getSubject().isBlank()
        ? "General Tutoring"
        : request.getSubject().trim();

    try {
      BookingRecord booking = userRepository.createBooking(
          student.id(),
          request.getTutorId(),
          request.getSlotId(),
          subject,
          nextDateFor(slot.dayOfWeek()).toString(),
          request.getNote() == null ? "" : request.getNote().trim());

      return Map.of("message", "Booking request created", "booking", toMap(booking));
    } catch (DuplicateKeyException exception) {
      throw new SlotUnavailableException();
    }
  }

  public Map<String, Object> getMySessions(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(StudentOnlyBookingException::new);
    List<Map<String, Object>> sessions = userRepository.findSessionsByUser(user.id(), user.role()).stream()
        .map(session -> toMap(session, user.role()))
        .toList();

    return Map.of("sessions", sessions);
  }

  public Map<String, Object> getMySession(String userId, String bookingId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);
    SessionRecord session = userRepository.findSessionByIdForUser(user.id(), user.role(), bookingId)
        .orElseThrow(BookingNotFoundException::new);

    return Map.of("session", toMap(session, user.role()));
  }

  public Map<String, Object> cancelBooking(String userId, String bookingId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      throw new BookingCancellationException("Only students can cancel their bookings");
    }

    SessionRecord session = userRepository.findSessionByIdForStudent(user.id(), bookingId)
        .orElseThrow(BookingNotFoundException::new);

    if (isPast(session)) {
      throw new BookingCancellationException("Past sessions cannot be cancelled");
    }

    if (!List.of("Pending", "Confirmed").contains(session.status())) {
      throw new BookingCancellationException("Only upcoming pending or confirmed bookings can be cancelled");
    }

    userRepository.updateBookingStatus(bookingId, "Cancelled");
    SessionRecord cancelledSession = userRepository.findSessionByIdForStudent(user.id(), bookingId)
        .orElseThrow(BookingNotFoundException::new);

    return Map.of(
        "message", "Booking cancelled successfully",
        "session", toMap(cancelledSession, user.role()));
  }

  public Map<String, Object> setSessionPrice(String userId, String bookingId, SetSessionPriceRequest request) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Tutor".equals(user.role())) {
      throw new BookingCancellationException("Only tutors can set session prices");
    }

    if ("Suspended".equals(user.status())) {
      throw new BookingCancellationException("Suspended tutors cannot set session prices");
    }

    if (!userRepository.updateSessionPriceForTutor(user.id(), bookingId, request.getPrice())) {
      throw new BookingNotFoundException();
    }

    SessionRecord session = userRepository.findSessionByIdForUser(user.id(), user.role(), bookingId)
        .orElseThrow(BookingNotFoundException::new);

    return Map.of(
        "message", "Session price updated",
        "session", toMap(session, user.role()));
  }

  private LocalDate nextDateFor(String dayName) {
    DayOfWeek targetDay = DayOfWeek.valueOf(dayName.toUpperCase(Locale.ROOT));
    LocalDate today = LocalDate.now();
    int daysUntilTarget = (targetDay.getValue() - today.getDayOfWeek().getValue() + 7) % 7;
    return today.plusDays(daysUntilTarget);
  }

  private boolean isPast(SessionRecord session) {
    if (session.sessionDate() == null || session.sessionDate().isBlank()) {
      return false;
    }

    String endTime = normalizeTime(session.endTime());
    LocalTime end = endTime.isBlank() ? LocalTime.MAX : LocalTime.parse(endTime);
    return LocalDate.parse(session.sessionDate()).atTime(end).isBefore(java.time.LocalDateTime.now());
  }

  private Map<String, Object> toMap(BookingRecord booking) {
    return Map.of(
        "id", booking.id(),
        "tutorId", booking.tutorId(),
        "slotId", booking.slotId(),
        "subject", booking.subject(),
        "status", booking.status(),
        "sessionDate", booking.sessionDate());
  }

  private Map<String, Object> toMap(SessionRecord session, String viewerRole) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", session.id());
    data.put("participantName", session.participantName());
    data.put("participantRole", "Tutor".equals(viewerRole) ? "Student" : "Tutor");
    data.put("studentId", session.studentId());
    data.put("studentName", session.studentName());
    data.put("tutorId", session.tutorId());
    data.put("tutorName", session.tutorName());
    data.put("amountDue", session.hourlyRate());
    data.put("sessionPrice", session.sessionPrice());
    data.put("paymentId", session.paymentId() == null ? "" : session.paymentId());
    data.put("paymentStatus", session.paymentStatus() == null ? "" : session.paymentStatus());
    data.put("slipFileName", session.slipFileName() == null ? "" : session.slipFileName());
    data.put("subject", session.subject());
    data.put("status", session.status());
    data.put("sessionDate", session.sessionDate());
    data.put("dayOfWeek", session.dayOfWeek());
    data.put("startTime", normalizeTime(session.startTime()));
    data.put("endTime", normalizeTime(session.endTime()));
    data.put("note", session.note() == null ? "" : session.note());
    data.put("reviewed", session.reviewed());
    return data;
  }

  private String normalizeTime(String value) {
    if (value == null || value.isBlank()) {
      return "";
    }

    return LocalTime.parse(value).format(TIME_FORMAT);
  }
}
