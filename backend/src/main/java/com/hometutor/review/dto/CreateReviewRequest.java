package com.hometutor.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateReviewRequest {
  @NotBlank(message = "Booking ID is required")
  private String bookingId;

  @Min(value = 1, message = "Rating must be at least 1")
  @Max(value = 5, message = "Rating cannot be greater than 5")
  private int rating;

  private String comment;

  public String getBookingId() {
    return bookingId;
  }

  public void setBookingId(String bookingId) {
    this.bookingId = bookingId;
  }

  public int getRating() {
    return rating;
  }

  public void setRating(int rating) {
    this.rating = rating;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }
}
