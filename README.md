# Home Tutor Search and Booking System 📚

## Project Overview
[cite_start]This is a web-based application developed for the SE1020 Object-Oriented Programming module[cite: 1, 4]. The system allows students to search for available home tutors, manage bookings, and leave reviews. [cite_start]It demonstrates the practical application of OOP principles and file-based data management without the use of a traditional database[cite: 5, 7].

## Core Features & CRUD Operations
[cite_start]This project implements minimum 3 CRUD (Create, Read, Update, Delete) operations per team member using file handling techniques[cite: 8]:
* **User Management:** Register students and tutors, update profiles, and delete accounts (saves to `users.txt`).
* **Tutor Search & Catalog:** Add new subjects/tutors, search by subject or location, and update availability (saves to `tutors.txt`).
* **Booking System:** Create new tutoring appointments, read schedules, and cancel bookings (saves to `bookings.txt`). 
* **Feedback Management:** Submit, view, and moderate tutor reviews (saves to `reviews.txt`).

## Technologies Used
* [cite_start]**Backend:** Java, Spring Boot, JSP Servlets [cite: 12, 38]
* [cite_start]**Frontend:** HTML, CSS, JavaScript (with Bootstrap/Tailwind for UI enhancements) [cite: 12]
* [cite_start]**Data Storage:** File Read/Write operations (.txt files) [cite: 13, 39]
* [cite_start]**Version Control:** GitHub [cite: 14]

## OOP Concepts Applied
[cite_start]This system heavily utilizes core Object-Oriented Programming concepts[cite: 7]:
* **Encapsulation:** Securing user, tutor, and booking data within respective classes using getters and setters.
* **Inheritance:** Establishing a base `User` class, with `Student` and `Tutor` classes inheriting from it.
* **Polymorphism:** Utilizing method overriding for different types of users (e.g., distinct dashboard displays or booking permission checks).

## Setup Instructions
1. Clone this repository to your local machine.
2. [cite_start]Open the project folder in IntelliJ IDEA[cite: 11].
3. Ensure your Java and Spring Boot configurations are correctly set up.
4. [cite_start]Run the application and access the minimum 3 UI pages via your localhost[cite: 40].
