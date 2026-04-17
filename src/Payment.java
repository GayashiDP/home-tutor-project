public class Payment {
    private String invoiceId;
    private String studentId;
    private String tutorName;
    private String subject;
    private double amount;
    private String status;

    public Payment(String invoiceId, String studentId, String tutorName, String subject, double amount, String status) {
        this.invoiceId = invoiceId;
        this.studentId = studentId;
        this.tutorName = tutorName;
        this.subject = subject;
        this.amount = amount;
        this.status = status;
    }

    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String toFileString() {
        return invoiceId + "," + studentId + "," + tutorName + "," + subject + "," + amount + "," + status;
    }
}