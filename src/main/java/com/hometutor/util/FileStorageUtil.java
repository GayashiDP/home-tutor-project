package com.hometutor.util;

import com.hometutor.model.Tutor;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility class to demonstrate File Handling implementation for the project.
 * Uses BufferedReader/BufferedWriter to perform standard file read/write
 * operations
 * for "data storage" in the form of a comma-separated-values (CSV) file.
 */
public class FileStorageUtil {

    /**
     * Writes a list of tutors to a CSV file.
     * Demonstrates file write operation.
     * 
     * @param tutors   The list of tutors retrieved from the database.
     * @param filePath The absolute path indicating where the file should be
     *                 written.
     * @return true if successful or false otherwise.
     */
    public static boolean saveTutorsToCSV(List<Tutor> tutors, String filePath) {
        // Try-with-resources to ensure writers are automatically closed
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(filePath))) {
            // Write CSV Header
            bw.write("ID,FirstName,LastName,Email,Category,Rate,Status\n");

            for (Tutor tutor : tutors) {
                // Format the record data
                String line = String.format("%d,%s,%s,%s,%s,%.2f,%s\n",
                        tutor.getId(),
                        escapeSpecialCharacters(tutor.getFirstName()),
                        escapeSpecialCharacters(tutor.getLastName()),
                        escapeSpecialCharacters(tutor.getEmail()),
                        escapeSpecialCharacters(tutor.getCategory()),
                        tutor.getRate(),
                        tutor.getStatus());
                bw.write(line); // Write into the file
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Reads a list of minimal tutors from a CSV file.
     * Demonstrates file read operation.
     * 
     * @param filePath The exact path of the text file to read.
     * @return List of newly constructed Tutor objects stored in the text file.
     */
    public static List<Tutor> loadTutorsFromCSV(String filePath) {
        List<Tutor> tutors = new ArrayList<>();
        // Using BufferedReader to efficiently read text lines
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line = br.readLine(); // Skip header
            while ((line = br.readLine()) != null) {
                String[] values = line.split(",", -1);
                if (values.length >= 7) {
                    Tutor t = new Tutor();
                    try {
                        t.setId(Integer.parseInt(values[0]));
                        t.setFirstName(values[1].replace("\"", ""));
                        t.setLastName(values[2].replace("\"", ""));
                        t.setEmail(values[3].replace("\"", ""));
                        t.setCategory(values[4].replace("\"", ""));
                        t.setRate(Double.parseDouble(values[5]));
                        t.setStatus(values[6].replace("\"", ""));
                        tutors.add(t);
                    } catch (NumberFormatException nfe) {
                        // skip row if parsing error
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tutors;
    }

    // Helper method to prevent comma formatting issues in strings
    private static String escapeSpecialCharacters(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " "); // replace newlines
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
