package com.hometutor.dao;

import com.hometutor.model.Tutor;
import com.hometutor.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for handling Tutor database operations.
 * Demonstrates Abstraction and Encapsulation by hiding JDBC logic from Servlets.
 */
public class TutorDAO {

    /**
     * Creates a new Tutor listing in the database.
     * @param tutor The Tutor object to insert.
     * @return true if successful, false otherwise.
     */
    public boolean addTutor(Tutor tutor) {
        String sql = "INSERT INTO tutors (first_name, last_name, email, phone, bio, category, rate, teaching_level, teaching_mode, subject_desc, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, tutor.getFirstName());
            stmt.setString(2, tutor.getLastName());
            stmt.setString(3, tutor.getEmail());
            stmt.setString(4, tutor.getPhone());
            stmt.setString(5, tutor.getBio());
            stmt.setString(6, tutor.getCategory());
            stmt.setDouble(7, tutor.getRate());
            stmt.setString(8, tutor.getTeachingLevel());
            stmt.setString(9, tutor.getTeachingMode());
            stmt.setString(10, tutor.getSubjectDesc());
            stmt.setString(11, tutor.getStatus());

            int rowsInserted = stmt.executeUpdate();
            return rowsInserted > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Reads all tutors from the database.
     * @return A list of Tutor objects.
     */
    public List<Tutor> getAllTutors() {
        List<Tutor> tutorsList = new ArrayList<>();
        String sql = "SELECT * FROM tutors ORDER BY created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Tutor t = new Tutor();
                t.setId(rs.getInt("id"));
                t.setFirstName(rs.getString("first_name"));
                t.setLastName(rs.getString("last_name"));
                t.setEmail(rs.getString("email"));
                t.setPhone(rs.getString("phone"));
                t.setBio(rs.getString("bio"));
                t.setCategory(rs.getString("category"));
                t.setRate(rs.getDouble("rate"));
                t.setTeachingLevel(rs.getString("teaching_level"));
                t.setTeachingMode(rs.getString("teaching_mode"));
                t.setSubjectDesc(rs.getString("subject_desc"));
                t.setStatus(rs.getString("status"));
                
                tutorsList.add(t);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return tutorsList;
    }

    /**
     * Retrieves a single Tutor by their ID.
     */
    public Tutor getTutorById(int id) {
        Tutor t = null;
        String sql = "SELECT * FROM tutors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    t = new Tutor(
                        rs.getInt("id"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("bio"),
                        rs.getString("category"),
                        rs.getDouble("rate"),
                        rs.getString("teaching_level"),
                        rs.getString("teaching_mode"),
                        rs.getString("subject_desc"),
                        rs.getString("status")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return t;
    }

    /**
     * Deletes a tutor from the database.
     * @param id The ID of the tutor to delete.
     * @return true if successful.
     */
    public boolean deleteTutor(int id) {
        String sql = "DELETE FROM tutors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            int rowsDeleted = stmt.executeUpdate();
            return rowsDeleted > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Updates an existing tutor's information.
     * @param tutor The Tutor object with updated details.
     * @return true if successful.
     */
    public boolean updateTutor(Tutor tutor) {
        String sql = "UPDATE tutors SET first_name=?, last_name=?, email=?, phone=?, bio=?, " +
                "category=?, rate=?, teaching_level=?, teaching_mode=?, subject_desc=?, status=? " +
                "WHERE id=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, tutor.getFirstName());
            stmt.setString(2, tutor.getLastName());
            stmt.setString(3, tutor.getEmail());
            stmt.setString(4, tutor.getPhone());
            stmt.setString(5, tutor.getBio());
            stmt.setString(6, tutor.getCategory());
            stmt.setDouble(7, tutor.getRate());
            stmt.setString(8, tutor.getTeachingLevel());
            stmt.setString(9, tutor.getTeachingMode());
            stmt.setString(10, tutor.getSubjectDesc());
            stmt.setString(11, tutor.getStatus());
            stmt.setInt(12, tutor.getId()); // වැදගත්ම දේ: කාගේ ඩේටාද මාරු කරන්නේ කියලා කියන ID එක

            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

}
