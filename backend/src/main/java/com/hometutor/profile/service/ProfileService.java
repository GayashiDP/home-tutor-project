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
    // Repository object used to access user-related database operations
  private final UserRepository userRepository;
     // Constructor Injection
  public ProfileService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }
// Method to get profile details using user ID
  public Map<String, Object> getProfile(String userId) {

    // Find user by ID
    // If user is not found, throw ProfileNotFoundException
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(ProfileNotFoundException::new);

    // Convert user data into profile response map
    // Also fetch tutor subjects if available
    return toProfile(user, userRepository.findSubjectNamesByTutorId(user.id()));
  }
   
  // Method to update user profile
  public Map<String, Object> updateProfile(String userId, UpdateProfileRequest request) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(ProfileNotFoundException::new);
    String name = request.getName().trim();
    String bio = request.getBio() == null ? "" : request.getBio().trim();
 
    // Update profile details in database
    userRepository.updateProfile(user.id(), name, bio);

    // Check whether the user role is Tutor
    // Only tutors can update subjects

    if ("Tutor".equals(user.role())) {
      userRepository.replaceTutorSubjects(user.id(), request.normalizedSubjects());
    }
   // Return updated profile details
    return getProfile(user.id());
  }
    // Private helper method
  // Converts user object into a response map

  private Map<String, Object> toProfile(UserRecord user, List<String> subjects) {
     // Create key-value response data
    return Map.of(
        "id", user.id(),
        "name", user.name(),
        "email", user.email(),
        "role", user.role(),
        "bio", user.bio() == null ? "" : user.bio(),
        "subjects", subjects);
  }
}
