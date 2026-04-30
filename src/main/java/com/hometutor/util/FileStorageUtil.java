package com.hometutor.util;

import com.hometutor.model.Tutor;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


public class FileStorageUtil {

    
    public static boolean saveTutorsToCSV(List<Tutor> tutors, String filePath) {
       
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(filePath))) {
           
            bw.write("ID,FirstName,LastName,Email,Category,Rate,Status\n");

            for (Tutor tutor : tutors) {
                String line = String.format("%d,%s,%s,%s,%s,%.2f,%s\n",
                        tutor.getId(),
                        escapeSpecialCharacters(tutor.getFirstName()),
                        escapeSpecialCharacters(tutor.getLastName()),
                        escapeSpecialCharacters(tutor.getEmail()),
                        escapeSpecialCharacters(tutor.getCategory()),
                        tutor.getRate(),
                        tutor.getStatus());
                bw.write(line); 
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

   
    public static List<Tutor> loadTutorsFromCSV(String filePath) {
        List<Tutor> tutors = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line = br.readLine(); 
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
                        
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tutors;
    }

    
    private static String escapeSpecialCharacters(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " "); 
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
