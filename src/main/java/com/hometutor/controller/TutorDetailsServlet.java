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
 * Servlet for retrieving a specific tutor's details and forwarding to
 * tutor-details.jsp
 */
@WebServlet("/tutorDetails")
public class TutorDetailsServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        // Initialize the DAO layer
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect("listTutors");
            return;
        }

        try {
            int id = Integer.parseInt(idParam);
            Tutor tutor = tutorDAO.getTutorById(id);

            if (tutor != null) {
                request.setAttribute("tutor", tutor);
                request.getRequestDispatcher("tutor-details.jsp").forward(request, response);
            } else {
                response.sendRedirect("listTutors");
            }
        } catch (NumberFormatException e) {
            response.sendRedirect("listTutors");
        }
    }
}
