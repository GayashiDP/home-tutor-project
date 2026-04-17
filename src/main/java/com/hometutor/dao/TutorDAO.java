package com.hometutor.dao;

import com.hometutor.model.Tutor;
import com.hometutor.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for handling Tutor database operations.
 * Demonstrates Abstraction and Encapsulation by hiding JDBC logic from
 * Servlets.
 */
public class TutorDAO {

    /**
     * Adds a newly registered tutor into the database.
     * 
     * 
     * @param tutor The Tutor object to insert.
     * @return true if successful, false otherwise.
     */
    public boolean addTutor(Tutor tutor) {
        String sql = "INSERT INTO tutors (first_name, last_name, email, phone, bio, category, rate, teaching_level, teaching_mode, subject_desc, status) "
                +
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

            int rowsAdded = stmt.executeUpdate();
            return rowsAdded > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Reads all tutors from the database.
     * 
     * @return A list of Tutor objects.
     */
    public List<Tutor> getAllTutors() {
        List<Tutor> myTutors = new ArrayList<>();
        String sql = "SELECT * FROM tutors ORDER BY created_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Tutor tutorObj = extractTutorFromResultSet(rs);
                myTutors.add(tutorObj);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return myTutors;
    }

    /**
     * Gets a single tutor using their table ID, useful for the details page.
     */
    public Tutor getTutorById(int id) {
        Tutor foundTutor = null;
        String sql = "SELECT * FROM tutors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    foundTutor = extractTutorFromResultSet(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return foundTutor;
    }

    /**
     * Deletes a tutor from the database.
     * 
     * @param id The ID of the tutor to delete.
     * @return true if successful.
     */
    public boolean deleteTutor(int id) {
        String sql = "DELETE FROM tutors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            int rowsRemoved = stmt.executeUpdate();
            return rowsRemoved > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Updates an existing tutor's information.
     * 
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
            stmt.setInt(12, tutor.getId());

            int rowsChanged = stmt.executeUpdate();
            return rowsChanged > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * A helper method to avoid copying and pasting the result set extraction
     * everywhere.
     * 
     * 
     * @param rs The ResultSet positioned at the current row.
     * @return A mapped Tutor object.
     * @throws SQLException if a database access error occurs.
     */
    private Tutor extractTutorFromResultSet(ResultSet rs) throws SQLException {
        return new Tutor(
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
                rs.getString("status"));
    }
}
