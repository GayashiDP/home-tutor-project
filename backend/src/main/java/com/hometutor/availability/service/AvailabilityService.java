package com.hometutor.availability.service;

import com.hometutor.auth.exception.AccountSuspendedException;
import com.hometutor.availability.dto.SaveAvailabilityRequest;
import com.hometutor.availability.dto.SaveAvailabilityRequest.AvailabilitySlotRequest;
import com.hometutor.availability.dto.UpdateAvailabilitySlotRequest;
import com.hometutor.availability.exception.AvailabilitySlotNotFoundException;
import com.hometutor.availability.exception.ConfirmedBookingConflictException;
import com.hometutor.subject.exception.TutorOnlySubjectException;
import com.hometutor.tutor.exception.TutorNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.AvailabilitySlotRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class AvailabilityService {
  // Standard time format used for availability slots
  private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

  private final UserRepository userRepository;

  public AvailabilityService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  // Returns availability of the logged-in tutor
  public Map<String, Object> getMyAvailability(String userId) {
    UserRecord tutor = requireTutor(userId);
    return Map.of("slots", slots(tutor.id()));
  }

  // Returns availability of a selected tutor
  public Map<String, Object> getTutorAvailability(String tutorId) {
    if (userRepository.findTutorById(tutorId).isEmpty()) {
      throw new TutorNotFoundException();
    }

    return Map.of("slots", slots(tutorId));
  }

  // Saves tutor availability slots
  public Map<String, Object> saveMyAvailability(String userId, SaveAvailabilityRequest request) {
    UserRecord tutor = requireTutor(userId);
    List<AvailabilitySlotRecord> slots = request.getSlots().stream()
        .map(this::toRecord)
        .distinct()
        .toList();

    userRepository.replaceAvailabilitySlots(tutor.id(), slots);
    return Map.of("message", "Availability saved successfully", "slots", slots(tutor.id()));
  }

  // Updates one availability slot of the tutor
  public Map<String, Object> updateMyAvailabilitySlot(
      String userId,
      String slotId,
      UpdateAvailabilitySlotRequest request) {
    UserRecord tutor = requireTutor(userId);
    AvailabilitySlotRecord currentSlot = userRepository.findAvailabilitySlotForTutor(tutor.id(), slotId)
        .orElseThrow(AvailabilitySlotNotFoundException::new);
    AvailabilitySlotRecord nextSlot = toRecord(request);

    // Checks whether slot date or time has changed
    boolean timingChanged = !currentSlot.dayOfWeek().equals(nextSlot.dayOfWeek())
        || !normalizeTime(currentSlot.startTime()).equals(nextSlot.startTime())
        || !normalizeTime(currentSlot.endTime()).equals(nextSlot.endTime());

    // Prevents changes if the slot already has a confirmed booking
    if ((timingChanged || "cancelled".equals(nextSlot.status())) && userRepository.hasConfirmedBookingForSlot(slotId)) {
      throw new ConfirmedBookingConflictException();
    }

    // Prevents availability overlap with confirmed bookings
    if ("available".equals(nextSlot.status())
        && userRepository.hasConfirmedBookingOverlap(
            tutor.id(),
            slotId,
            nextSlot.dayOfWeek(),
            nextSlot.startTime(),
            nextSlot.endTime())) {
      throw new ConfirmedBookingConflictException();
    }

    AvailabilitySlotRecord updatedSlot = userRepository.updateAvailabilitySlot(
        tutor.id(),
        slotId,
        nextSlot.dayOfWeek(),
        nextSlot.startTime(),
        nextSlot.endTime(),
        nextSlot.status());

    int notificationsSent = 0;

    // Notifies students if pending booking slot time changed or was cancelled
    if (timingChanged || "cancelled".equals(nextSlot.status())) {
      notificationsSent = userRepository.notifyPendingBookingStudentsForSlot(
          slotId,
          "Your pending tutoring request has a schedule update. Please review the tutor's latest availability.");
    }

    return Map.of(
        "message", "Availability slot updated successfully",
        "slot", toMap(updatedSlot, new HashSet<>(userRepository.findBookedSlotIdsByTutorId(tutor.id()))),
        "notificationsSent", notificationsSent,
        "pendingBookings", userRepository.countPendingBookingsForSlot(slotId));
  }

  // Ensures the user is a valid active tutor
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

  // Gets tutor slots and marks booked slots correctly
  private List<Map<String, Object>> slots(String tutorId) {
    Set<String> bookedSlotIds = new HashSet<>(userRepository.findBookedSlotIdsByTutorId(tutorId));
    return userRepository.findAvailabilityByTutorId(tutorId).stream()
        .map(slot -> toMap(slot, bookedSlotIds))
        .toList();
  }

  // Converts save request slot into database record format
  private AvailabilitySlotRecord toRecord(AvailabilitySlotRequest slot) {
    LocalTime start = LocalTime.parse(slot.getStartTime());
    LocalTime end = LocalTime.parse(slot.getEndTime());

    // End time must be later than start time
    if (!end.isAfter(start)) {
      throw new IllegalArgumentException("End time must be after start time");
    }

    return new AvailabilitySlotRecord(
        null,
        slot.getDayOfWeek(),
        start.format(TIME_FORMAT),
        end.format(TIME_FORMAT),
        "available");
  }

  // Converts update request slot into database record format
  private AvailabilitySlotRecord toRecord(UpdateAvailabilitySlotRequest slot) {
    LocalTime start = LocalTime.parse(slot.getStartTime());
    LocalTime end = LocalTime.parse(slot.getEndTime());

    // End time must be later than start time
    if (!end.isAfter(start)) {
      throw new IllegalArgumentException("End time must be after start time");
    }

    String status = slot.getStatus() == null || slot.getStatus().isBlank()
        ? "available"
        : slot.getStatus().trim().toLowerCase();

    // Only valid availability statuses are allowed
    if (!List.of("available", "cancelled").contains(status)) {
      throw new IllegalArgumentException("Availability status must be available or cancelled");
    }

    return new AvailabilitySlotRecord(
        null,
        slot.getDayOfWeek(),
        start.format(TIME_FORMAT),
        end.format(TIME_FORMAT),
        status);
  }

  // Converts slot record into API response format
  private Map<String, Object> toMap(AvailabilitySlotRecord slot, Set<String> bookedSlotIds) {
     
    // Override status to "booked" if slot is already reserved
    String status = bookedSlotIds.contains(slot.id())
        ? "booked"
        : slot.status() == null ? "available" : slot.status();

    return Map.of(
        "id", slot.id() == null ? "" : slot.id(),
        "dayOfWeek", slot.dayOfWeek(),
        "startTime", normalizeTime(slot.startTime()),
        "endTime", normalizeTime(slot.endTime()),
        "status", status);
  }

  // Converts time into HH:mm format
  private String normalizeTime(String value) {
    return LocalTime.parse(value).format(TIME_FORMAT);
  }
}
