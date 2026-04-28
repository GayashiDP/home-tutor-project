package com.hometutor.controller;

import com.hometutor.dao.TutorDAO;
import com.hometutor.model.Tutor;
import com.hometutor.util.FileStorageUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

/**
 * Controller to handle "Export Data" functionality.
 * Generates the CSV using FileStorageUtil and streams it to the user.
 */
@WebServlet("/backupTutors")
public class BackupTutorsServlet extends HttpServlet {

    private TutorDAO tutorDAO;

    public void init() {
        tutorDAO = new TutorDAO();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        List<Tutor> allTutors = tutorDAO.getAllTutors();

        // Use a temporary folder for creating the file on the server
        String tempDir = System.getProperty("java.io.tmpdir");
        String filePath = tempDir + File.separator + "tutors_backup.csv";

        // Write the data to a CSV file (Evaluated under: File Handling)
        boolean isSaved = FileStorageUtil.saveTutorsToCSV(allTutors, filePath);

        if (isSaved) {
            File downloadFile = new File(filePath);
            response.setContentType("text/csv");
            response.setContentLength((int) downloadFile.length());
            // Prompts a browser download
            response.setHeader("Content-Disposition", "attachment; filename=\"tutors_backup.csv\"");

            // Output Stream to send file back
            try (FileInputStream inStream = new FileInputStream(downloadFile);
                    OutputStream outStream = response.getOutputStream()) {

                byte[] buffer = new byte[4096];
                int bytesRead = -1;
                while ((bytesRead = inStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, bytesRead);
                }
            }
        } else {
            response.sendRedirect("listTutors?error=backup_failed");
        }
    }
}
