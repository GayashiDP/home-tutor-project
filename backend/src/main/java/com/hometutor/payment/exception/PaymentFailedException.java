package com.hometutor.payment.exception;

public class PaymentFailedException extends RuntimeException {
  public PaymentFailedException(String message) {
    super(message);
  }
}
