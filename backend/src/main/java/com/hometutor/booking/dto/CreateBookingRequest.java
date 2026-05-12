package com.hometutor.booking.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateBookingRequest {
  @NotBlank(message = "Tutor is required")
  private String tutorId;

  @NotBlank(message = "Availability slot is required")
  private String slotId;

  private String subject;
  private String note;

  public String getTutorId() {
    return tutorId;
  }

  public void setTutorId(String tutorId) {
    this.tutorId = tutorId;
  }

  public String getSlotId() {
    return slotId;
  }

  public void setSlotId(String slotId) {
    this.slotId = slotId;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }
}
