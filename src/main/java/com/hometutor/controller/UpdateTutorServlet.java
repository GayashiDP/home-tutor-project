package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;
import com.hometutor.model.Tutor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/updateTutor")
public class UpdateTutorServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect("listTutors");
            return;
        }

        try {
            int id = Integer.parseInt(idParam);
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String category = request.getParameter("category");
            String rateStr = request.getParameter("rate");
            String teachingLevel = request.getParameter("teachingLevel");
            String status = request.getParameter("status");
            String bio = request.getParameter("bio");

            double rate = 0.0;
            if (rateStr != null && !rateStr.isEmpty()) {
                rate = Double.parseDouble(rateStr);
            }

            // Fetch existing tutor to retain fields not updated in the form
            Tutor existingTutor = tutorDAO.getTutorById(id);
            if (existingTutor != null) {
                existingTutor.setFirstName(firstName);
                existingTutor.setLastName(lastName);
                existingTutor.setCategory(category);
                existingTutor.setRate(rate);
                existingTutor.setTeachingLevel(teachingLevel);
                existingTutor.setStatus(status);
                existingTutor.setBio(bio);

                boolean success = tutorDAO.updateTutor(existingTutor);
                if (success) {
                    response.sendRedirect("tutorDetails?id=" + id + "&updated=1");
                } else {
                    response.sendRedirect("tutorDetails?id=" + id + "&error=1");
                }
            } else {
                response.sendRedirect("listTutors");
            }
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.sendRedirect("listTutors");
        }
    }
}
