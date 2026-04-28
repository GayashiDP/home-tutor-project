package com.hometour.reviews.controller;

import com.hometour.reviews.model.Review;
import com.hometour.reviews.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/search")
    public List<Review> searchReviews(@RequestParam String q) {
        return reviewService.searchReviews(q);
    }

    @PostMapping
    public Review addReview(@RequestBody Review review) {
        try {
            System.out.println("DEBUG: Receiving Review POST: " + review);
            return reviewService.saveReview(review);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in addReview: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}

