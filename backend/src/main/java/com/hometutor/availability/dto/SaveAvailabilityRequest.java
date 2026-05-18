package com.hometutor.availability.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class SaveAvailabilityRequest {
  @Valid
  private List<AvailabilitySlotRequest> slots = new ArrayList<>();

  public List<AvailabilitySlotRequest> getSlots() {
    return slots;
  }

  public void setSlots(List<AvailabilitySlotRequest> slots) {
    this.slots = slots == null ? new ArrayList<>() : slots;
  }

  public static class AvailabilitySlotRequest {
    @NotBlank(message = "Day is required")
    private String dayOfWeek;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

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
  }
}
