package com.hometutor.auth.service;

import com.hometutor.auth.dto.LoginRequest;
import com.hometutor.auth.dto.RegisterRequest;
import com.hometutor.auth.exception.AuthenticationRequiredException;
import com.hometutor.auth.exception.DuplicateEmailException;
import com.hometutor.auth.exception.InvalidCredentialsException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.UserRecord;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final String jwtSecret;
  private final long jwtExpirationMs;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

  public AuthService(
      UserRepository userRepository,
      @Value("${auth.jwt.secret}") String jwtSecret,
      @Value("${auth.jwt.expiration-ms}") long jwtExpirationMs) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.jwtExpirationMs = jwtExpirationMs;
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
    String token = createJwt(user);

    return Map.of("token", token, "user", publicUser);
  }

  public String requireUserId(String authorizationHeader) {
    try {
      String userId = Jwts.parser()
          .verifyWith(signingKey())
          .build()
          .parseSignedClaims(extractToken(authorizationHeader))
          .getPayload()
          .getSubject();

      if (userId == null || userId.isBlank()) {
        throw new AuthenticationRequiredException();
      }

      return userId;
    } catch (JwtException | IllegalArgumentException exception) {
      throw new AuthenticationRequiredException();
    }
  }

  public void refreshSessionUser(String authorizationHeader, Map<String, Object> user) {
    // JWTs are stateless. Profile changes are reflected through DB-backed profile reads.
  }

  private String createJwt(UserRecord user) {
    Date issuedAt = new Date();
    Date expiresAt = new Date(issuedAt.getTime() + jwtExpirationMs);

    return Jwts.builder()
        .subject(user.id())
        .claim("email", user.email())
        .claim("role", user.role())
        .issuedAt(issuedAt)
        .expiration(expiresAt)
        .signWith(signingKey())
        .compact();
  }

  private SecretKey signingKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
  }

  private String extractToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new AuthenticationRequiredException();
    }

    return authorizationHeader.substring("Bearer ".length()).trim();
  }
}
