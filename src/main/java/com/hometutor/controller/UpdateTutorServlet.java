package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;
import com.hometutor.model.Tutor;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@WebServlet("/updateTutor")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 5, maxRequestSize = 1024 * 1024 * 5 * 5)
public class UpdateTutorServlet extends HttpServlet {
    private TutorDAO tutorDAO;

    @Override
    public void init() throws ServletException {
        tutorDAO = new TutorDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Helps reading special characters like names with accents correctly
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

            // First grab the old tutor details from DB so we don't accidentally wipe stuff
            // out
            Tutor tutorToUpdate = tutorDAO.getTutorById(id);
            if (tutorToUpdate == null) {
                response.sendRedirect("listTutors");
                return;
            }

            // Image upload handling
            Part filePart = request.getPart("image");
            if (filePart != null && filePart.getSize() > 0) {
                String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
                if (fileName != null && !fileName.isEmpty() && !fileName.contains("..")) {
                    String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
                    String uploadPath = getServletContext().getRealPath("") + File.separator + "images";
                    File uploadDir = new File(uploadPath);
                    if (!uploadDir.exists())
                        uploadDir.mkdir();
                    filePart.write(uploadPath + File.separator + uniqueFileName);
                    tutorToUpdate.setImagePath("images/" + uniqueFileName);
                }
            }

            // Update with the new form values
            tutorToUpdate.setFirstName(firstName);
            tutorToUpdate.setLastName(lastName);
            tutorToUpdate.setCategory(category);
            tutorToUpdate.setRate(rate);
            tutorToUpdate.setTeachingLevel(teachingLevel);
            tutorToUpdate.setStatus(status);
            tutorToUpdate.setBio(bio);

            boolean updateFinished = tutorDAO.updateTutor(tutorToUpdate);
            if (updateFinished) {
                response.sendRedirect("tutorDetails?id=" + id + "&updated=1");
            } else {
                response.sendRedirect("tutorDetails?id=" + id + "&error=1");
            }
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.sendRedirect("listTutors");
        }
    }
}
