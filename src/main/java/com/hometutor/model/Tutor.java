package com.hometutor.model;

/**
 * Tutor model class that represents a single record in the 'tutors' table.
 * Demonstrates OOP concepts like Encapsulation (private fields, public getters/setters).
 */
public class Tutor {
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String bio;
    private String category;
    private double rate;
    private String teachingLevel;
    private String teachingMode;
    private String subjectDesc;
    private String status;

    // Default Constructor
    public Tutor() {
    }

    // Parameterized Constructor
    public Tutor(int id, String firstName, String lastName, String email, String phone, String bio, 
                 String category, double rate, String teachingLevel, String teachingMode, 
                 String subjectDesc, String status) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.bio = bio;
        this.category = category;
        this.rate = rate;
        this.teachingLevel = teachingLevel;
        this.teachingMode = teachingMode;
        this.subjectDesc = subjectDesc;
        this.status = status;
    }

    // Getters and Setters (Encapsulation)

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getRate() { return rate; }
    public void setRate(double rate) { this.rate = rate; }

    public String getTeachingLevel() { return teachingLevel; }
    public void setTeachingLevel(String teachingLevel) { this.teachingLevel = teachingLevel; }

    public String getTeachingMode() { return teachingMode; }
    public void setTeachingMode(String teachingMode) { this.teachingMode = teachingMode; }

    public String getSubjectDesc() { return subjectDesc; }
    public void setSubjectDesc(String subjectDesc) { this.subjectDesc = subjectDesc; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
