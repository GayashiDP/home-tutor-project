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
 * This servlet gets the form data when someone adds a new tutor.
 */
@WebServlet("/addTutor")
public class AddTutorServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        // Create DAO so we can run queries later
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

        // Check the rate and convert it from String to double
        double rate = 0;
        if (rateStr != null && !rateStr.isEmpty()) {
            rate = Double.parseDouble(rateStr);
        }

        // Create a Tutor object with the form data
        Tutor newTutor = new Tutor(0, firstName, lastName, email, phone, bio, category, rate, teachingLevel,
                teachingMode, subjectDesc, status);

        // Send it to the database
        boolean addedSuccessfully = tutorDAO.addTutor(newTutor);

        if (addedSuccessfully) {
            // It worked, take them to the catalog page and show success msg
            response.sendRedirect("listTutors?added=1");
        } else {
            // Something broke, maybe DB error, send them back
            response.sendRedirect("add-tutor.jsp?error=1");
        }
    }
}
