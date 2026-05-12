package com.hometutor.payment.service;

import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.payment.dto.CheckoutRequest;
import com.hometutor.payment.exception.PaymentFailedException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.PaymentRecord;
import com.hometutor.user.UserRepository.ReceiptRecord;
import com.hometutor.user.UserRepository.SessionRecord;
import com.hometutor.user.UserRepository.TransactionRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
  private static final DateTimeFormatter EXPIRY_FORMAT = DateTimeFormatter.ofPattern("MM/yy");

  private final UserRepository userRepository;

  public PaymentService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Map<String, Object> checkout(String userId, CheckoutRequest request) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      throw new PaymentFailedException("Only students can pay for bookings");
    }

    SessionRecord session = userRepository.findSessionByIdForStudent(user.id(), request.getBookingId())
        .orElseThrow(BookingNotFoundException::new);

    if (!"Pending".equals(session.status())) {
      throw new PaymentFailedException("Only pending bookings can be paid");
    }

    validateMockCard(request);

    BigDecimal amount = session.hourlyRate() == null ? BigDecimal.ZERO : session.hourlyRate();
    String receiptNo = "HTS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    PaymentRecord payment = userRepository.createPayment(
        request.getBookingId(),
        user.id(),
        amount,
        "Completed",
        receiptNo);
    ReceiptRecord receipt = userRepository.createReceipt(
        request.getBookingId(),
        payment.id(),
        receiptNo,
        amount);
    userRepository.updateBookingStatus(request.getBookingId(), "Confirmed");

    SessionRecord confirmedSession = userRepository.findSessionByIdForStudent(user.id(), request.getBookingId())
        .orElseThrow(BookingNotFoundException::new);

    return Map.of(
        "message", "Payment completed successfully",
        "payment", toMap(payment),
        "receipt", toMap(receipt),
        "session", toSessionMap(confirmedSession));
  }

  public Map<String, Object> getPaymentHistory(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      return Map.of("transactions", List.of());
    }

    List<Map<String, Object>> transactions = userRepository.findPaymentsByStudentId(user.id()).stream()
        .map(this::toMap)
        .toList();

    return Map.of("transactions", transactions);
  }

  private void validateMockCard(CheckoutRequest request) {
    String cardNumber = request.getCardNumber().replaceAll("\\s+", "");
    String cvv = request.getCvv().trim();

    if (!cardNumber.matches("\\d{13,19}")) {
      throw new PaymentFailedException("Enter a valid card number");
    }

    if (cardNumber.startsWith("4000")) {
      throw new PaymentFailedException("Payment was declined by the mock processor. Try another test card.");
    }

    if (!cvv.matches("\\d{3,4}")) {
      throw new PaymentFailedException("Enter a valid CVV");
    }

    try {
      YearMonth expiry = YearMonth.parse(request.getExpiry(), EXPIRY_FORMAT);
      if (expiry.isBefore(YearMonth.now())) {
        throw new PaymentFailedException("Card expiry must be in the future");
      }
    } catch (DateTimeParseException exception) {
      throw new PaymentFailedException("Enter expiry as MM/YY");
    }
  }

  private Map<String, Object> toMap(PaymentRecord payment) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", payment.id());
    data.put("bookingId", payment.bookingId());
    data.put("amount", payment.amount());
    data.put("status", payment.status());
    data.put("receiptNo", payment.receiptNo());
    data.put("paidAt", payment.paidAt());
    return data;
  }

  private Map<String, Object> toMap(ReceiptRecord receipt) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", receipt.id());
    data.put("bookingId", receipt.bookingId());
    data.put("paymentId", receipt.paymentId());
    data.put("receiptNo", receipt.receiptNo());
    data.put("amount", receipt.amount());
    data.put("issuedAt", receipt.issuedAt());
    return data;
  }

  private Map<String, Object> toMap(TransactionRecord transaction) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", transaction.id());
    data.put("bookingId", transaction.bookingId());
    data.put("amount", transaction.amount());
    data.put("status", transaction.status());
    data.put("displayStatus", "Completed".equals(transaction.status()) ? "Paid" : transaction.status());
    data.put("receiptId", transaction.receiptId());
    data.put("receiptNo", transaction.generatedReceiptNo() == null ? "" : transaction.generatedReceiptNo());
    data.put("paidAt", transaction.paidAt() == null ? "" : transaction.paidAt());
    data.put("issuedAt", transaction.issuedAt() == null ? "" : transaction.issuedAt());
    data.put("createdAt", transaction.createdAt());
    data.put("subject", transaction.subject());
    data.put("sessionDate", transaction.sessionDate());
    data.put("startTime", transaction.startTime());
    data.put("endTime", transaction.endTime());
    data.put("tutorName", transaction.tutorName());
    data.put("studentName", transaction.studentName());
    data.put("bookingStatus", transaction.bookingStatus());
    return data;
  }

  private Map<String, Object> toSessionMap(SessionRecord session) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", session.id());
    data.put("tutorName", session.tutorName());
    data.put("studentName", session.studentName());
    data.put("subject", session.subject());
    data.put("status", session.status());
    data.put("sessionDate", session.sessionDate());
    data.put("startTime", session.startTime());
    data.put("endTime", session.endTime());
    data.put("amountDue", session.hourlyRate());
    data.put("reviewed", session.reviewed());
    return data;
  }
}
