package com.hometour.reviews.service;

import com.hometour.reviews.model.FeedbackReply;
import com.hometour.reviews.repository.FeedbackReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackReplyRepository replyRepository;

    public List<FeedbackReply> getRepliesByReviewId(Long reviewId) {
        return replyRepository.findByReviewId(reviewId);
    }

    public FeedbackReply saveReply(FeedbackReply reply) {
        return replyRepository.save(reply);
    }
}
