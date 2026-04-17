package com.hometutor.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * This class handles connection to the our MySQL database.
 * Made this to avoid writing connection code in every single DAO class.
 */
public class DatabaseConnection {
    // Database credentials
    private static final String URL = "jdbc:mysql://localhost:3306/home_tutor_db?useUnicode=true&characterEncoding=UTF-8";
    private static final String USER = "root";
    private static final String PASSWORD = "8520";

    static {
        try {
            // Load the MySQL JDBC Driver once when the class is loaded
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found. " + e.getMessage());
        }
    }

    /**
     * Obtains a connection to the database.
     * 
     * @return Connection object if successful, null otherwise.
     */
    public static Connection getConnection() {
        Connection connection = null;
        try {
            // Now actually connect to the DB
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (SQLException e) {
            System.err.println("Connection failed. Check credentials and database name. " + e.getMessage());
        }
        return connection;
    }
}
