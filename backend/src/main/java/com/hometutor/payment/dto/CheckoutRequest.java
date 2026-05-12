package com.hometutor.payment.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {
  @NotBlank(message = "Booking is required")
  private String bookingId;

  @NotBlank(message = "Card number is required")
  private String cardNumber;

  @NotBlank(message = "Expiry is required")
  private String expiry;

  @NotBlank(message = "CVV is required")
  private String cvv;

  public String getBookingId() {
    return bookingId;
  }

  public void setBookingId(String bookingId) {
    this.bookingId = bookingId;
  }

  public String getCardNumber() {
    return cardNumber;
  }

  public void setCardNumber(String cardNumber) {
    this.cardNumber = cardNumber;
  }

  public String getExpiry() {
    return expiry;
  }

  public void setExpiry(String expiry) {
    this.expiry = expiry;
  }

  public String getCvv() {
    return cvv;
  }

  public void setCvv(String cvv) {
    this.cvv = cvv;
  }
}
