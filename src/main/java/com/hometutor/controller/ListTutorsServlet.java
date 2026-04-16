package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;
import com.hometutor.model.Tutor;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Servlet for listing all tutors from the DB and passing them to the JSP page.
 */
@WebServlet("/listTutors")
public class ListTutorsServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Fetch the list of tutors from the database
        List<Tutor> allTutors = tutorDAO.getAllTutors();

        // Pass the list as an attribute to the request
        request.setAttribute("tutorsList", allTutors);

        // Forward the request and response to the JSP file
        RequestDispatcher dispatcher = request.getRequestDispatcher("tutor-catalog.jsp");
        dispatcher.forward(request, response);
    }
}
