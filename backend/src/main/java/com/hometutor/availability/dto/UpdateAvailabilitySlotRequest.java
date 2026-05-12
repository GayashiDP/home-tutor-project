package com.hometutor.availability.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateAvailabilitySlotRequest {
  @NotBlank(message = "Day is required")
  private String dayOfWeek;

  @NotBlank(message = "Start time is required")
  private String startTime;

  @NotBlank(message = "End time is required")
  private String endTime;

  private String status = "available";

  public String getDayOfWeek() {
    return dayOfWeek;
  }

  public void setDayOfWeek(String dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
  }

  public String getStartTime() {
    return startTime;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public String getEndTime() {
    return endTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
