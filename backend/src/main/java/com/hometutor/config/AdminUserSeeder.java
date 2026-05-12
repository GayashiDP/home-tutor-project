package com.hometutor.config;

import com.hometutor.user.UserRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserSeeder implements ApplicationRunner {
  private static final Logger logger = LoggerFactory.getLogger(AdminUserSeeder.class);

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
  private final String adminEmail;
  private final String adminPassword;
  private final String adminName;

  public AdminUserSeeder(
      UserRepository userRepository,
      @Value("${app.admin.email}") String adminEmail,
      @Value("${app.admin.password}") String adminPassword,
      @Value("${app.admin.name}") String adminName) {
    this.userRepository = userRepository;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;
    this.adminName = adminName;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (isBlank(adminEmail) || isBlank(adminPassword)) {
      return;
    }

    String email = adminEmail.trim().toLowerCase();
    try {
      userRepository.allowAdminRole();
      userRepository.upsertAdmin(
          UUID.randomUUID().toString(),
          isBlank(adminName) ? "Admin User" : adminName.trim(),
          email,
          passwordEncoder.encode(adminPassword));
      logger.info("Configured admin user is ready: {}", email);
    } catch (DataAccessException exception) {
      logger.warn("Could not configure admin user because the database is unavailable: {}", exception.getMessage());
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
