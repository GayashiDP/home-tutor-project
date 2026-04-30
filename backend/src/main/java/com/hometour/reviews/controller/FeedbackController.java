package com.hometour.reviews.controller;

import com.hometour.reviews.model.FeedbackReply;
import com.hometour.reviews.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/review/{reviewId}")
    public List<FeedbackReply> getReplies(@PathVariable Long reviewId) {
        return feedbackService.getRepliesByReviewId(reviewId);
    }

    @PostMapping
    public FeedbackReply addReply(@RequestBody FeedbackReply reply) {
        return feedbackService.saveReply(reply);
    }
}
