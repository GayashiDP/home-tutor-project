package com.hometour.reviews.service;

import com.hometour.reviews.model.Review;
import com.hometour.reviews.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> searchReviews(String query) {
        return reviewRepository.findByHouseNameContainingIgnoreCaseOrCommentContainingIgnoreCase(query, query);
    }

    public Review saveReview(Review review) {
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}
