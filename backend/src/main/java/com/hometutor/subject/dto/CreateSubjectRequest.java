package com.hometutor.subject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateSubjectRequest {
  @NotBlank(message = "Subject name is required")
  @Size(max = 255, message = "Subject name must be no more than 255 characters")
  private String name;

  @Size(max = 1000, message = "Description must be no more than 1000 characters")
  private String description;

  @Size(max = 100, message = "Grade level must be no more than 100 characters")
  private String gradeLevel;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getGradeLevel() {
    return gradeLevel;
  }

  public void setGradeLevel(String gradeLevel) {
    this.gradeLevel = gradeLevel;
  }
}
