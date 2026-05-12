package com.hometutor.booking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SetSessionPriceRequest {
  @NotNull(message = "Price is required")
  @DecimalMin(value = "0.01", message = "Price must be greater than zero")
  private BigDecimal price;

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }
}
