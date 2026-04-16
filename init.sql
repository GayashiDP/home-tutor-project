-- Run this file in your MySQL database (e.g. via phpMyAdmin or MySQL Workbench)
-- It will create the 'tutors' table that our program uses to save subjects/tutors.

-- Create database if you haven't already
CREATE DATABASE IF NOT EXISTS home_tutor_db;

-- Use the database
USE home_tutor_db;

-- Drop table if it already exists to start fresh (optional)
-- DROP TABLE IF EXISTS tutors;

-- Create tutors table to match our form from add-subject.html
CREATE TABLE IF NOT EXISTS tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    category VARCHAR(50) NOT NULL,
    rate DOUBLE NOT NULL,
    teaching_level VARCHAR(50),
    teaching_mode VARCHAR(50),
    subject_desc TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some dummy data to see it in action initially
INSERT INTO tutors (first_name, last_name, email, phone, bio, category, rate, teaching_level, teaching_mode, subject_desc, status)
VALUES 
('Priya', 'Fernando', 'priya@example.com', '0771234567', 'Experienced Maths Teacher', 'Mathematics', 1500, 'O/L (Grade 10–11)', 'Both', 'Covers core maths concepts and exam papers.', 'active'),
('Kamal', 'Perera', 'kamal@example.com', '0719876543', 'BSc in Chemistry, 5 years exp.', 'Chemistry', 1200, 'A/L (Grade 12–13)', 'Online', 'In-depth chemistry classes covering theory and practicals virtually.', 'active');
