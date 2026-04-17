<%@ page contentType="text/html;charset=UTF-8" language="java" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HomeTutor</title>
        <link rel="icon" type="image/svg+xml" href="favicon.svg" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet" />
        <link rel="stylesheet" href="styles.css" />
    </head>

    <body>
        <!-- ========== NAVBAR ========== -->
        <nav class="navbar navbar-expand-lg hts-navbar sticky-top">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center gap-2" href="index.jsp">
                    <img src="favicon.svg" alt="HomeTutor Logo" width="32" height="32" />
                    <span class="fw-bold">HomeTutor</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navMenu">
                    <ul class="navbar-nav mx-auto gap-1">
                        <li class="nav-item"><a class="nav-link" href="index.jsp">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="listTutors">Find Tutors</a></li>
                        <li class="nav-item"><a class="nav-link" href="schedule.html">Schedule</a></li>
                        <li class="nav-item"><a class="nav-link" href="booking.html">Bookings</a></li>
                        <li class="nav-item"><a class="nav-link" href="payments.html">Payments</a></li>
                        <li class="nav-item"><a class="nav-link" href="reviews.html">Reviews</a></li>
                        <li class="nav-item admin-only">
                            <a class="nav-link" href="add-tutor.jsp"
                                style="color:#059669 !important; font-weight:600;">+ Add Subject</a>
                        </li>
                    </ul>
                    <div class="d-flex gap-2 align-items-center mt-2 mt-lg-0">
                        <span class="role-badge admin" id="roleBadge">👨‍💼 Admin</span>
                        <a href="login.html" class="btn btn-outline-green btn-sm">Logout</a>
                    </div>
                </div>
            </div>
        </nav>