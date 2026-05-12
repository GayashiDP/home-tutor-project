package com.hometutor.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class UpdateProfileRequest {
  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
  private String name;

  @Size(max = 1000, message = "Bio must be no more than 1000 characters")
  private String bio;

  private List<String> subjects = new ArrayList<>();

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public List<String> getSubjects() {
    return subjects;
  }

  public void setSubjects(List<String> subjects) {
    this.subjects = subjects == null ? new ArrayList<>() : subjects;
  }

  public List<String> normalizedSubjects() {
    return subjects.stream()
        .map(String::trim)
        .filter(subject -> !subject.isBlank())
        .distinct()
        .limit(20)
        .toList();
  }
}
