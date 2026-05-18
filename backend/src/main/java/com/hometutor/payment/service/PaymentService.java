package com.hometutor.payment.service;

import com.hometutor.admin.exception.AdminAccessException;
import com.hometutor.booking.exception.BookingNotFoundException;
import com.hometutor.payment.exception.PaymentFailedException;
import com.hometutor.user.UserRepository;
import com.hometutor.user.UserRepository.PaymentApprovalRecord;
import com.hometutor.user.UserRepository.PaymentRecord;
import com.hometutor.user.UserRepository.ReceiptDownloadRecord;
import com.hometutor.user.UserRepository.PaymentSlipRecord;
import com.hometutor.user.UserRepository.SessionRecord;
import com.hometutor.user.UserRepository.TransactionRecord;
import com.hometutor.user.UserRepository.UserRecord;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PaymentService {
  private final UserRepository userRepository;

  public PaymentService(UserRepository userRepository) {
    this.userRepository = userRepository;
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

  public ReceiptFile downloadReceipt(String userId, String receiptOrPaymentId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      throw new PaymentFailedException("Only students can download payment receipts");
    }

    ReceiptDownloadRecord receipt = userRepository.findReceiptForStudent(user.id(), receiptOrPaymentId)
        .orElseThrow(() -> new PaymentFailedException("Receipt not found"));

    if (!"Completed".equals(receipt.paymentStatus())) {
      throw new PaymentFailedException("Receipt is available only after payment approval");
    }

    String receiptNo = receipt.receiptNo() == null || receipt.receiptNo().isBlank()
        ? "receipt-" + receipt.receiptId()
        : receipt.receiptNo();

    return new ReceiptFile(receiptNo + ".pdf", createReceiptPdf(receipt, receiptNo));
  }

  public Map<String, Object> uploadSlip(String userId, String bookingId, MultipartFile slip) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(BookingNotFoundException::new);

    if (!"Student".equals(user.role())) {
      throw new PaymentFailedException("Only students can upload payment slips");
    }

    SessionRecord session = userRepository.findSessionByIdForStudent(user.id(), bookingId)
        .orElseThrow(BookingNotFoundException::new);

    if (!List.of("Pending", "Confirmed").contains(session.status())) {
      throw new PaymentFailedException("Payment slips can only be uploaded for pending or confirmed sessions");
    }

    if ("PendingApproval".equals(session.paymentStatus())) {
      throw new PaymentFailedException("A payment slip is already waiting for admin approval");
    }

    validateSlip(slip);

    BigDecimal amount = session.hourlyRate() == null ? BigDecimal.ZERO : session.hourlyRate();
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new PaymentFailedException("The tutor must set a session price before payment");
    }

    try {
      PaymentRecord payment = userRepository.createSlipPayment(
          bookingId,
          user.id(),
          amount,
          "SLIP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
          cleanFileName(slip.getOriginalFilename()),
          slip.getContentType() == null ? "application/octet-stream" : slip.getContentType(),
          slip.getBytes());

      SessionRecord updatedSession = userRepository.findSessionByIdForStudent(user.id(), bookingId)
          .orElseThrow(BookingNotFoundException::new);

      return Map.of(
          "message", "Payment slip uploaded. Waiting for admin approval.",
          "payment", toMap(payment),
          "session", toSessionMap(updatedSession));
    } catch (java.io.IOException exception) {
      throw new PaymentFailedException("Could not read uploaded payment slip");
    }
  }

  public Map<String, Object> getPendingApprovals(String userId) {
    requireAdmin(userId);
    return Map.of(
        "payments",
        userRepository.findPendingSlipPaymentsForAdmin().stream().map(this::toMap).toList());
  }

  public PaymentSlipRecord getPaymentSlip(String userId, String paymentId) {
    requireAdmin(userId);
    return userRepository.findPaymentSlipById(paymentId)
        .orElseThrow(() -> new PaymentFailedException("Payment slip not found"));
  }

  @Transactional
  public Map<String, Object> approvePayment(String userId, String paymentId) {
    UserRecord admin = requireAdmin(userId);
    PaymentApprovalRecord payment = userRepository.findPaymentApprovalById(paymentId)
        .orElseThrow(() -> new PaymentFailedException("Payment not found"));

    if ("Completed".equals(payment.status())) {
      return Map.of("message", "Payment was already approved", "payment", toMap(payment));
    }

    if ("Rejected".equals(payment.status())) {
      throw new PaymentFailedException("This payment slip was already rejected");
    }

    if (!"PendingApproval".equals(payment.status())) {
      throw new PaymentFailedException("Only pending payment slips can be approved. Current status: " + payment.status());
    }

    if (!userRepository.approveSlipPayment(payment.id(), admin.id())) {
      throw new PaymentFailedException("Payment is no longer pending approval");
    }

    userRepository.updateBookingStatus(payment.bookingId(), "Confirmed");
    userRepository.createReceipt(payment.bookingId(), payment.id(), payment.receiptNo(), payment.amount());
    userRepository.createAuditLog(admin.id(), "APPROVE_PAYMENT", "payments", payment.id(),
        "Approved payment slip for booking " + payment.bookingId());

    PaymentApprovalRecord approved = userRepository.findPaymentApprovalById(payment.id()).orElse(payment);
    return Map.of("message", "Payment approved", "payment", toMap(approved));
  }

  @Transactional
  public Map<String, Object> rejectPayment(String userId, String paymentId) {
    UserRecord admin = requireAdmin(userId);
    PaymentApprovalRecord payment = userRepository.findPaymentApprovalById(paymentId)
        .orElseThrow(() -> new PaymentFailedException("Payment not found"));

    if ("Rejected".equals(payment.status())) {
      return Map.of("message", "Payment was already rejected", "payment", toMap(payment));
    }

    if ("Completed".equals(payment.status())) {
      throw new PaymentFailedException("This payment has already been approved and cannot be rejected");
    }

    if (!"PendingApproval".equals(payment.status())) {
      throw new PaymentFailedException("Only pending payment slips can be rejected. Current status: " + payment.status());
    }

    if (!userRepository.rejectSlipPayment(payment.id(), admin.id())) {
      throw new PaymentFailedException("Payment is no longer pending approval");
    }

    userRepository.createAuditLog(admin.id(), "REJECT_PAYMENT", "payments", payment.id(),
        "Rejected payment slip for booking " + payment.bookingId());

    PaymentApprovalRecord rejected = userRepository.findPaymentApprovalById(payment.id()).orElse(payment);
    return Map.of("message", "Payment rejected", "payment", toMap(rejected));
  }

  private UserRecord requireAdmin(String userId) {
    UserRecord user = userRepository.findById(userId)
        .orElseThrow(() -> new AdminAccessException("Only admins can approve payments"));

    if (!"Admin".equals(user.role())) {
      throw new AdminAccessException("Only admins can approve payments");
    }

    return user;
  }

  private void validateSlip(MultipartFile slip) {
    if (slip == null || slip.isEmpty()) {
      throw new PaymentFailedException("Upload a payment slip file");
    }

    if (slip.getSize() > 5 * 1024 * 1024) {
      throw new PaymentFailedException("Payment slip must be 5MB or smaller");
    }

    String type = slip.getContentType() == null ? "" : slip.getContentType().toLowerCase();
    if (!List.of("image/jpeg", "image/png", "image/webp", "application/pdf").contains(type)) {
      throw new PaymentFailedException("Upload a JPG, PNG, WebP, or PDF payment slip");
    }
  }

  private String cleanFileName(String fileName) {
    if (fileName == null || fileName.isBlank()) {
      return "payment-slip";
    }

    return java.nio.file.Paths.get(fileName).getFileName().toString();
  }

  private byte[] createReceiptPdf(ReceiptDownloadRecord receipt, String receiptNo) {
    List<String> lines = List.of(
        "HOME TUTOR SYSTEM",
        "Payment Receipt",
        "",
        "Receipt No: " + receiptNo,
        "Payment ID: " + receipt.paymentId(),
        "Issued At: " + value(receipt.issuedAt()),
        "Paid At: " + value(receipt.paidAt()),
        "",
        "Student: " + value(receipt.studentName()),
        "Tutor: " + value(receipt.tutorName()),
        "Subject: " + value(receipt.subject()),
        "Session Date: " + value(receipt.sessionDate()),
        "Session Time: " + value(receipt.startTime()) + " - " + value(receipt.endTime()),
        "",
        "Amount Paid: " + receipt.amount(),
        "Status: Paid",
        "",
        "Thank you for using Home Tutor System.");

    StringBuilder content = new StringBuilder();
    content.append("BT\n/F1 12 Tf\n50 780 Td\n");
    for (int index = 0; index < lines.size(); index++) {
      if (index == 0) {
        content.append("/F1 18 Tf\n");
      } else if (index == 1) {
        content.append("/F1 14 Tf\n");
      } else if (index == 2) {
        content.append("/F1 12 Tf\n");
      }
      content.append("(").append(pdfEscape(lines.get(index))).append(") Tj\n0 -24 Td\n");
    }
    content.append("ET\n");

    byte[] stream = content.toString().getBytes(StandardCharsets.US_ASCII);
    List<byte[]> objects = new ArrayList<>();
    objects.add("<< /Type /Catalog /Pages 2 0 R >>".getBytes(StandardCharsets.US_ASCII));
    objects.add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>".getBytes(StandardCharsets.US_ASCII));
    objects.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>".getBytes(StandardCharsets.US_ASCII));
    objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>".getBytes(StandardCharsets.US_ASCII));
    objects.add(("<< /Length " + stream.length + " >>\nstream\n" + content + "endstream").getBytes(StandardCharsets.US_ASCII));

    StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
    List<Integer> offsets = new ArrayList<>();
    for (int index = 0; index < objects.size(); index++) {
      offsets.add(pdf.toString().getBytes(StandardCharsets.US_ASCII).length);
      pdf.append(index + 1).append(" 0 obj\n")
          .append(new String(objects.get(index), StandardCharsets.US_ASCII))
          .append("\nendobj\n");
    }

    int xrefOffset = pdf.toString().getBytes(StandardCharsets.US_ASCII).length;
    pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
    pdf.append("0000000000 65535 f \n");
    for (Integer offset : offsets) {
      pdf.append(String.format("%010d 00000 n \n", offset));
    }
    pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n")
        .append("startxref\n").append(xrefOffset).append("\n%%EOF\n");

    return pdf.toString().getBytes(StandardCharsets.US_ASCII);
  }

  private String pdfEscape(String value) {
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
  }

  private String value(String value) {
    return value == null || value.isBlank() ? "-" : value;
  }

  public record ReceiptFile(String fileName, byte[] data) {
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

  private Map<String, Object> toMap(PaymentApprovalRecord payment) {
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", payment.id());
    data.put("bookingId", payment.bookingId());
    data.put("studentId", payment.studentId());
    data.put("amount", payment.amount());
    data.put("status", payment.status());
    data.put("receiptNo", payment.receiptNo());
    data.put("createdAt", payment.createdAt());
    data.put("slipUploadedAt", payment.slipUploadedAt());
    data.put("slipFileName", payment.slipFileName());
    data.put("slipContentType", payment.slipContentType());
    data.put("subject", payment.subject());
    data.put("sessionDate", payment.sessionDate());
    data.put("startTime", payment.startTime());
    data.put("endTime", payment.endTime());
    data.put("studentName", payment.studentName());
    data.put("tutorName", payment.tutorName());
    data.put("bookingStatus", payment.bookingStatus());
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
    data.put("sessionPrice", session.sessionPrice());
    data.put("paymentId", session.paymentId() == null ? "" : session.paymentId());
    data.put("paymentStatus", session.paymentStatus() == null ? "" : session.paymentStatus());
    data.put("slipFileName", session.slipFileName() == null ? "" : session.slipFileName());
    data.put("reviewed", session.reviewed());
    data.put("reviewAvailableAt", session.reviewAvailableAt() == null ? "" : session.reviewAvailableAt());
    data.put("reviewWindowOpen", session.reviewWindowOpen());
    data.put("canReview", session.canReview());
    return data;
  }
}
