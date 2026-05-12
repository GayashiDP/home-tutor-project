package com.hometutor.booking.service;

import com.hometutor.booking.dto.CreateBookingRequest;
import com.hometutor.booking.exception.SlotUnavailableException;
import com.hometutor.booking.exception.StudentOnlyBookingException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.AvailabilitySlotRecord;
import com.hometutor.user.UserRepository.BookingRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {
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

  private LocalDate nextDateFor(String dayName) {
    DayOfWeek targetDay = DayOfWeek.valueOf(dayName.toUpperCase(Locale.ROOT));
    LocalDate today = LocalDate.now();
    int daysUntilTarget = (targetDay.getValue() - today.getDayOfWeek().getValue() + 7) % 7;
    return today.plusDays(daysUntilTarget);
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
}
