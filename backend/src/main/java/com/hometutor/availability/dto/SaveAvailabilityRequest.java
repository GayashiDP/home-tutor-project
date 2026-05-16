package com.hometutor.availability.dto;

// Imports @Valid to validate nested objects inside the list
import jakarta.validation.Valid;

// Imports @NotBlank to make sure fields are not empty or blank
import jakarta.validation.constraints.NotBlank;

// Imports ArrayList and List to store multiple availability slots
import java.util.ArrayList;
import java.util.List;

// DTO class used to receive availability data from the request body
public class SaveAvailabilityRequest {

  // This list stores all availability slots sent by the user
  // @Valid ensures each AvailabilitySlotRequest object inside the list is validated
  @Valid
  private List<AvailabilitySlotRequest> slots = new ArrayList<>();

  // Getter method to return the list of availability slots
  public List<AvailabilitySlotRequest> getSlots() {
    return slots;
  }

  // Setter method to update the slots list
  // If slots is null, it assigns an empty ArrayList to avoid NullPointerException
  public void setSlots(List<AvailabilitySlotRequest> slots) {
    this.slots = slots == null ? new ArrayList<>() : slots;
  }

  // Static inner DTO class used to represent one availability slot
  public static class AvailabilitySlotRequest {

    // Stores the day of the week, example: Monday
    // @NotBlank means this field cannot be empty or blank
    @NotBlank(message = "Day is required")
    private String dayOfWeek;

    // Stores the starting time of the availability slot
    // @NotBlank means start time must be provided
    @NotBlank(message = "Start time is required")
    private String startTime;

    // Stores the ending time of the availability slot
    // @NotBlank means end time must be provided
    @NotBlank(message = "End time is required")
    private String endTime;

    // Getter method to return dayOfWeek
    public String getDayOfWeek() {
      return dayOfWeek;
    }

    // Setter method to set dayOfWeek
    public void setDayOfWeek(String dayOfWeek) {
      this.dayOfWeek = dayOfWeek;
    }

    // Getter method to return startTime
    public String getStartTime() {
      return startTime;
    }

    // Setter method to set startTime
    public void setStartTime(String startTime) {
      this.startTime = startTime;
    }

    // Getter method to return endTime
    public String getEndTime() {
      return endTime;
    }

    // Setter method to set endTime
    public void setEndTime(String endTime) {
      this.endTime = endTime;
    }
  }
}
