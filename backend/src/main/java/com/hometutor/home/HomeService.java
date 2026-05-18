package com.hometutor.home;

import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.HomepageStatsRecord;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class HomeService {
  private final UserRepository userRepository;

  public HomeService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> summary() {
    HomepageStatsRecord stats = userRepository.homepageStats();
    return Map.of(
        "stats", Map.of(
            "activeStudents", stats.activeStudents(),
            "expertTutors", stats.expertTutors(),
            "subjectsCovered", stats.subjectsCovered(),
            "satisfactionRate", stats.satisfactionRate()),
        "subjects", userRepository.findActiveSubjectNames());
  }
}
