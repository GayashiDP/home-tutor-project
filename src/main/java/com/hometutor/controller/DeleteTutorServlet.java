package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet for deleting a Tutor by their ID.
 */
@WebServlet("/deleteTutor")
public class DeleteTutorServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String idStr = request.getParameter("id");
        if (idStr != null && !idStr.isEmpty()) {
            int id = Integer.parseInt(idStr);
            // Delete the tutor using DAO
            tutorDAO.deleteTutor(id);
        }

        // Redirect back to the tutor list
        response.sendRedirect("listTutors?deleted=1");
    }
}
