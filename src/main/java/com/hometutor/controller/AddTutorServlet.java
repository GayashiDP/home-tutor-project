package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;
import com.hometutor.model.Tutor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for handling the addition of a new Tutor to the DB.
 */
@WebServlet("/addTutor")
public class AddTutorServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        // Initialize the DAO layer
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Retrieve form data
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String bio = request.getParameter("bio");
        String category = request.getParameter("category");
        String rateStr = request.getParameter("rate");
        String teachingLevel = request.getParameter("teachingLevel");
        String teachingMode = request.getParameter("teachingMode");
        String subjectDesc = request.getParameter("subjectDesc");
        String status = request.getParameter("status");

        // Basic validation and parsing
        double rate = 0;
        if (rateStr != null && !rateStr.isEmpty()) {
            rate = Double.parseDouble(rateStr);
        }

        // Create a Tutor object with the form data
        Tutor newTutor = new Tutor(0, firstName, lastName, email, phone, bio, category, rate, teachingLevel,
                teachingMode, subjectDesc, status);

        // Call the DAO to add it to the database
        boolean isSuccess = tutorDAO.addTutor(newTutor);

        if (isSuccess) {
            // Redirect to tutor-catalog with success flag
            response.sendRedirect("listTutors?added=1");
        } else {
            // Handle failure scenario (e.g., redirect to error page or back with error msg)
            response.sendRedirect("add-tutor.jsp?error=1");
        }
    }
}
