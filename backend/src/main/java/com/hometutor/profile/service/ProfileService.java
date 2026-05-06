package com.hometutor.profile.service;

import com.hometutor.profile.dto.UpdateProfileRequest;
import com.hometutor.profile.exception.ProfileNotFoundException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.UserRecord;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
  private final UserRepository userRepository;

  public ProfileService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> getProfile(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(ProfileNotFoundException::new);
    return toProfile(user, userRepository.findSubjectNamesByTutorId(user.id()));
  }

  public Map<String, Object> updateProfile(String userId, UpdateProfileRequest request) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(ProfileNotFoundException::new);
    String name = request.getName().trim();
    String bio = request.getBio() == null ? "" : request.getBio().trim();

    userRepository.updateProfile(user.id(), name, bio);

    if ("Tutor".equals(user.role())) {
      userRepository.replaceTutorSubjects(user.id(), request.normalizedSubjects());
    }

    return getProfile(user.id());
  }

  private Map<String, Object> toProfile(UserRecord user, List<String> subjects) {
    return Map.of(
        "id", user.id(),
        "name", user.name(),
        "email", user.email(),
        "role", user.role(),
        "bio", user.bio() == null ? "" : user.bio(),
        "subjects", subjects);
  }
}
