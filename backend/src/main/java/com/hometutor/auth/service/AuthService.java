package com.hometutor.auth.service;

import com.hometutor.auth.dto.LoginRequest;
import com.hometutor.auth.dto.RegisterRequest;
import com.hometutor.auth.exception.AuthenticationRequiredException;
import com.hometutor.auth.exception.DuplicateEmailException;
import com.hometutor.auth.exception.InvalidCredentialsException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.UserRecord;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
  private final SecureRandom secureRandom = new SecureRandom();
  private final Map<String, Map<String, Object>> sessions = new ConcurrentHashMap<>();

  public AuthService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> register(RegisterRequest request) {
    String email = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(email)) {
      throw new DuplicateEmailException();
    }

    String id = UUID.randomUUID().toString();
    String passwordHash = passwordEncoder.encode(request.getPassword());

    try {
      userRepository.create(id, request.getFullName().trim(), email, passwordHash, request.getRole());
    } catch (DuplicateKeyException exception) {
      throw new DuplicateEmailException();
    }

    return Map.of(
        "id", id,
        "name", request.getFullName().trim(),
        "email", email,
        "role", request.getRole());
  }

  public Map<String, Object> login(LoginRequest request) {
    String email = request.getEmail().trim().toLowerCase();
    UserRecord user = userRepository.findByEmail(email)
        .orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(request.getPassword(), user.passwordHash())) {
      throw new InvalidCredentialsException();
    }

    Map<String, Object> publicUser = Map.of(
        "id", user.id(),
        "name", user.name(),
        "email", user.email(),
        "role", user.role(),
        "bio", user.bio() == null ? "" : user.bio());
    String token = createSessionToken();
    sessions.put(token, publicUser);

    return Map.of("token", token, "user", publicUser);
  }

  public String requireUserId(String authorizationHeader) {
    Map<String, Object> user = sessions.get(extractToken(authorizationHeader));

    if (user == null) {
      throw new AuthenticationRequiredException();
    }

    return user.get("id").toString();
  }

  public void refreshSessionUser(String authorizationHeader, Map<String, Object> user) {
    sessions.put(extractToken(authorizationHeader), user);
  }

  private String createSessionToken() {
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String extractToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new AuthenticationRequiredException();
    }

    return authorizationHeader.substring("Bearer ".length()).trim();
  }
}
