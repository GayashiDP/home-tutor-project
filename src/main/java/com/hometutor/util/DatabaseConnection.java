package com.hometutor.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Utility class to handle the connection to the MySQL database.
 * This class ensures that there is only one way to get a connection string.
 */
public class DatabaseConnection {
    // Database credentials and connection URL
    // Update these to match your local setup if different!
    private static final String URL = "jdbc:mysql://localhost:3306/home_tutor_db";
    private static final String USER = "root";
    private static final String PASSWORD = "8520";

    /**
     * Obtains a connection to the database.
     * @return Connection object if successful, null otherwise.
     */
    public static Connection getConnection() {
        Connection connection = null;
        try {
            // Load the MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Connect to the database
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("Connection to home_tutor_db successful.");
        } catch (ClassNotFoundException e) {
            System.out.println("MySQL JDBC Driver not found. " + e.getMessage());
        } catch (SQLException e) {
            System.out.println("Connection failed. Check credentials and database name. " + e.getMessage());
        }
        return connection;
    }
}
