package com.hometour.reviews.repository;

import com.hometour.reviews.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHouseNameContainingIgnoreCaseOrCommentContainingIgnoreCase(String houseName, String comment);
}
