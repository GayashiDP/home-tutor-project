package com.hometutor.tutor.controller;

import com.hometutor.tutor.service.TutorService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {
  private final TutorService tutorService;

  public TutorController(TutorService tutorService) {
    this.tutorService = tutorService;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> getTutors(
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String subject) {
    return ResponseEntity.ok(tutorService.getTutors(name, subject));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Map<String, Object>> getTutor(@PathVariable String id) {
    return ResponseEntity.ok(tutorService.getTutor(id));
  }
}
