package com.hometutor.live.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SaveLiveSessionRequest {
  @NotBlank(message = "Booking id is required")
  private String bookingId;

  @Size(max = 140, message = "Title must be 140 characters or fewer")
  private String title;

  @Size(max = 1000, message = "Description must be 1000 characters or fewer")
  private String description;

  @NotBlank(message = "Platform is required")
  @Size(max = 40, message = "Platform must be 40 characters or fewer")
  private String platform;

  @NotBlank(message = "Meeting link is required")
  @Size(max = 700, message = "Meeting link must be 700 characters or fewer")
  private String meetingLink;

  @NotBlank(message = "Scheduled start time is required")
  private String scheduledStart;

  @NotBlank(message = "Scheduled end time is required")
  private String scheduledEnd;

  public String getBookingId() {
    return bookingId;
  }

  public void setBookingId(String bookingId) {
    this.bookingId = bookingId;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getPlatform() {
    return platform;
  }

  public void setPlatform(String platform) {
    this.platform = platform;
  }

  public String getMeetingLink() {
    return meetingLink;
  }

  public void setMeetingLink(String meetingLink) {
    this.meetingLink = meetingLink;
  }

  public String getScheduledStart() {
    return scheduledStart;
  }

  public void setScheduledStart(String scheduledStart) {
    this.scheduledStart = scheduledStart;
  }

  public String getScheduledEnd() {
    return scheduledEnd;
  }

  public void setScheduledEnd(String scheduledEnd) {
    this.scheduledEnd = scheduledEnd;
  }
}
