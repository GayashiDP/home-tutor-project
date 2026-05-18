package com.hometutor.live.service;

import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.live.dto.SaveLiveSessionRequest;
import com.hometutor.live.exception.LiveSessionException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.LiveSessionRecord;
import com.hometutor.user.UserRepository.SessionRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LiveSessionService {
  private static final Duration JOIN_WINDOW_BEFORE_START = Duration.ofMinutes(15);
  private static final Duration MIN_SESSION_LENGTH = Duration.ofMinutes(15);
  private static final Duration MAX_SESSION_LENGTH = Duration.ofHours(4);

  private final UserRepository userRepository;

  public LiveSessionService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> getMyLiveSessions(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!List.of("Student", "Tutor").contains(user.role())) {
      return Map.of("liveSessions", List.of());
    }

    return Map.of(
        "liveSessions",
        userRepository.findLiveSessionsByUser(user.id(), user.role()).stream()
            .map(session -> toMap(session, user.role()))
            .toList());
  }

  public Map<String, Object> getLiveSessionForBooking(String userId, String bookingId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    LiveSessionRecord liveSession = userRepository.findLiveSessionForBookingForUser(user.id(), user.role(), bookingId)
        .orElseThrow(() -> new LiveSessionException("Live session has not been scheduled yet"));

    return Map.of("liveSession", toMap(liveSession, user.role()));
  }

  @Transactional
  public Map<String, Object> saveLiveSession(String userId, SaveLiveSessionRequest request) {
    UserRecord tutor = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Tutor".equals(tutor.role())) {
      throw new LiveSessionException("Only tutors can schedule live sessions");
    }

    if ("Suspended".equals(tutor.status())) {
      throw new LiveSessionException("Suspended tutors cannot schedule live sessions");
    }

    SessionRecord booking = userRepository.findSessionByIdForUser(tutor.id(), tutor.role(), request.getBookingId())
        .orElseThrow(BookingNotFoundException::new);

    if (!"Confirmed".equals(booking.status())) {
      throw new LiveSessionException("Live lectures can be scheduled only after the booking is confirmed by payment approval");
    }

    OffsetDateTime start = parseDateTime(request.getScheduledStart(), "scheduled start time");
    OffsetDateTime end = parseDateTime(request.getScheduledEnd(), "scheduled end time");
    validateSchedule(start, end);

    String existingId = userRepository.findLiveSessionForBookingForUser(tutor.id(), tutor.role(), booking.id())
        .map(LiveSessionRecord::id)
        .orElse(null);

    if (userRepository.hasLiveSessionOverlapForTutor(tutor.id(), start.toString(), end.toString(), existingId)) {
      throw new LiveSessionException("This live session overlaps with another scheduled tutor lecture");
    }

    if (userRepository.hasLiveSessionOverlapForStudent(booking.studentId(), start.toString(), end.toString(), existingId)) {
      throw new LiveSessionException("The student already has another live lecture at this time");
    }

    LiveSessionRecord liveSession = userRepository.upsertLiveSession(
        booking.id(),
        tutor.id(),
        booking.studentId(),
        cleanTitle(request.getTitle(), booking.subject()),
        cleanOptional(request.getDescription()),
        cleanPlatform(request.getPlatform()),
        cleanMeetingLink(request.getMeetingLink()),
        start.toString(),
        end.toString());

    return Map.of(
        "message", existingId == null ? "Live lecture scheduled" : "Live lecture updated",
        "liveSession", toMap(liveSession, tutor.role()));
  }

  @Transactional
  public Map<String, Object> cancelLiveSession(String userId, String liveSessionId) {
    UserRecord tutor = requireTutor(userId);

    if (!userRepository.updateLiveSessionStatusForTutor(liveSessionId, tutor.id(), "Cancelled")) {
      throw new LiveSessionException("Live session not found");
    }

    LiveSessionRecord liveSession = userRepository.findLiveSessionByIdForUser(tutor.id(), tutor.role(), liveSessionId)
        .orElseThrow(() -> new LiveSessionException("Live session not found"));

    return Map.of("message", "Live lecture cancelled", "liveSession", toMap(liveSession, tutor.role()));
  }

  @Transactional
  public Map<String, Object> completeLiveSession(String userId, String liveSessionId) {
    UserRecord tutor = requireTutor(userId);

    if (!userRepository.updateLiveSessionStatusForTutor(liveSessionId, tutor.id(), "Completed")) {
      throw new LiveSessionException("Live session not found");
    }

    LiveSessionRecord liveSession = userRepository.findLiveSessionByIdForUser(tutor.id(), tutor.role(), liveSessionId)
        .orElseThrow(() -> new LiveSessionException("Live session not found"));

    return Map.of("message", "Live lecture marked as completed", "liveSession", toMap(liveSession, tutor.role()));
  }

  private UserRecord requireTutor(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Tutor".equals(user.role())) {
      throw new LiveSessionException("Only tutors can manage live sessions");
    }

    return user;
  }

  private OffsetDateTime parseDateTime(String value, String fieldName) {
    try {
      return OffsetDateTime.parse(value);
    } catch (DateTimeParseException exception) {
      throw new IllegalArgumentException("Invalid " + fieldName + ". Use ISO format, for example 2026-05-19T14:00:00+05:30");
    }
  }

  private void validateSchedule(OffsetDateTime start, OffsetDateTime end) {
    if (!end.isAfter(start)) {
      throw new LiveSessionException("Live session end time must be after the start time");
    }

    Duration length = Duration.between(start, end);
    if (length.compareTo(MIN_SESSION_LENGTH) < 0) {
      throw new LiveSessionException("Live session must be at least 15 minutes long");
    }

    if (length.compareTo(MAX_SESSION_LENGTH) > 0) {
      throw new LiveSessionException("Live session cannot be longer than 4 hours");
    }

    if (start.isBefore(OffsetDateTime.now().minusMinutes(5))) {
      throw new LiveSessionException("Live session cannot be scheduled in the past");
    }
  }

  private String cleanTitle(String title, String subject) {
    String value = title == null || title.isBlank() ? subject + " Live Lecture" : title.trim();
    return value.length() > 140 ? value.substring(0, 140) : value;
  }

  private String cleanOptional(String value) {
    return value == null ? "" : value.trim();
  }

  private String cleanPlatform(String value) {
    String platform = value == null || value.isBlank() ? "Google Meet" : value.trim();
    return platform.length() > 40 ? platform.substring(0, 40) : platform;
  }

  private String cleanMeetingLink(String value) {
    String link = value == null ? "" : value.trim();
    if (!(link.startsWith("https://") || link.startsWith("http://"))) {
      throw new LiveSessionException("Meeting link must start with http:// or https://");
    }
    return link;
  }

  private Map<String, Object> toMap(LiveSessionRecord session, String viewerRole) {
    OffsetDateTime start = parseStoredDateTime(session.scheduledStart());
    OffsetDateTime end = parseStoredDateTime(session.scheduledEnd());
    OffsetDateTime now = OffsetDateTime.now();
    String effectiveStatus = effectiveStatus(session.status(), start, end, now);
    boolean canJoin = !List.of("Cancelled", "Completed").contains(effectiveStatus)
        && !now.isBefore(start.minus(JOIN_WINDOW_BEFORE_START))
        && now.isBefore(end);

    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", session.id());
    data.put("bookingId", session.bookingId());
    data.put("studentId", session.studentId());
    data.put("studentName", session.studentName());
    data.put("tutorId", session.tutorId());
    data.put("tutorName", session.tutorName());
    data.put("subject", session.subject());
    data.put("title", session.title());
    data.put("description", session.description() == null ? "" : session.description());
    data.put("platform", session.platform());
    data.put("meetingLink", "Tutor".equals(viewerRole) || canJoin ? session.meetingLink() : "");
    data.put("joinUrl", canJoin ? session.meetingLink() : "");
    data.put("scheduledStart", start.toString());
    data.put("scheduledEnd", end.toString());
    data.put("status", session.status());
    data.put("displayStatus", effectiveStatus);
    data.put("canJoin", canJoin);
    data.put("joinOpensAt", start.minus(JOIN_WINDOW_BEFORE_START).toString());
    data.put("createdAt", session.createdAt());
    data.put("updatedAt", session.updatedAt());
    return data;
  }

  private OffsetDateTime parseStoredDateTime(String value) {
    try {
      return OffsetDateTime.parse(value.replace(" ", "T"));
    } catch (DateTimeParseException exception) {
      return OffsetDateTime.parse(value);
    }
  }

  private String effectiveStatus(String storedStatus, OffsetDateTime start, OffsetDateTime end, OffsetDateTime now) {
    if (List.of("Cancelled", "Completed").contains(storedStatus)) {
      return storedStatus;
    }
    if (!now.isBefore(start) && now.isBefore(end)) {
      return "Live";
    }
    if (!now.isBefore(end)) {
      return "Completed";
    }
    return "Scheduled";
  }
}
