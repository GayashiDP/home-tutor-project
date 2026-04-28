package com.hometour.reviews.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackReply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reviewId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String replyText;

    private String adminName;

    private LocalDateTime repliedAt;

    @PrePersist
    protected void onReply() {
        repliedAt = LocalDateTime.now();
    }
}
