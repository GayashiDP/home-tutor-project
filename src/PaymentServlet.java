import java.io.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/paymentServlet")
public class PaymentServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String method = request.getParameter("paymentMethod");
        String cardName = request.getParameter("cardName");


        String invoiceId = "INV-" + (int)(Math.random() * 10000);
        String studentId = "STU-001";
        String tutorName = "Ms. Priya Fernando";
        String subject = "Mathematics";
        double amount = 3000.0;
        String status = "Paid";

        Payment newPayment = new Payment(invoiceId, studentId, tutorName, subject, amount, status);


        String filePath = getServletContext().getRealPath("/") + "payments.txt";


        try (FileWriter fw = new FileWriter(filePath, true);
             BufferedWriter bw = new BufferedWriter(fw);
             PrintWriter out = new PrintWriter(bw)) {

            out.println(newPayment.toFileString());

        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }

        response.sendRedirect("payments.html");
    }
}