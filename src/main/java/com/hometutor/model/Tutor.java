package com.hometutor.model;

/**
 * Tutor model class that maps to the 'tutors' table in our database.
 * Using Encapsulation here by keeping the variables private.
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
    private String imagePath;

    // Default Constructor (needed so we can create an empty object first)
    public Tutor() {
    }

    // Constructor with all parameters so we can quickly set all details at once
    public Tutor(int id, String firstName, String lastName, String email, String phone, String bio,
            String category, double rate, String teachingLevel, String teachingMode,
            String subjectDesc, String status, String imagePath) {
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
        this.imagePath = imagePath;
    }

    // Getters and Setters (Encapsulation)

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getRate() {
        return rate;
    }

    // Make sure no one can enter a negative rate by mistake!
    public void setRate(double rate) {
        if (rate >= 0) {
            this.rate = rate;
        } else {
            this.rate = 0; // default to 0 if they try to enter negatives
        }
    }

    public String getTeachingLevel() {
        return teachingLevel;
    }

    public void setTeachingLevel(String teachingLevel) {
        this.teachingLevel = teachingLevel;
    }

    public String getTeachingMode() {
        return teachingMode;
    }

    public void setTeachingMode(String teachingMode) {
        this.teachingMode = teachingMode;
    }

    public String getSubjectDesc() {
        return subjectDesc;
    }

    public void setSubjectDesc(String subjectDesc) {
        this.subjectDesc = subjectDesc;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}
