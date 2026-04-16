<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
    <%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Add Tutor — HomeTutor</title>
            <link rel="icon"
                href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet" />
            <link rel="stylesheet" href="styles.css" />
            <script src="scripts.js"></script>

        </head>

        <body>

            <!-- NAVBAR -->
            <nav class="navbar navbar-expand-lg hts-navbar sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="index.jsp">
                        <span class="logo-box">📚</span> HomeTutor
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navMenu">
                        <ul class="navbar-nav mx-auto gap-1">
                            <li class="nav-item"><a class="nav-link" href="index.jsp">Home</a></li>
                            <!-- Updates to use servlet backend -->
                            <li class="nav-item"><a class="nav-link" href="listTutors">Find Tutors</a></li>
                            <li class="nav-item"><a class="nav-link" href="schedule.html">Schedule</a></li>
                            <li class="nav-item"><a class="nav-link active" href="add-tutor.jsp"
                                    style="color:#059669; font-weight: 600;">+ Add Subject</a></li>
                        </ul>
                        <div class="d-flex gap-2">
                            <a href="login.html" class="btn btn-outline-green btn-sm">Logout</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- PAGE BANNER -->
            <div class="page-banner">
                <div class="container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-2">
                            <li class="breadcrumb-item"><a href="index.jsp">Home</a></li>
                            <li class="breadcrumb-item"><a href="listTutors">Tutor Catalog</a></li>
                            <li class="breadcrumb-item active">Add Subject</li>
                        </ol>
                    </nav>
                    <h1>Add New Subject / Tutor</h1>
                    <p>Fill in the details below to create a new tutoring listing in the database</p>
                </div>
            </div>

            <main class="page-bg py-5">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8">

                            <!-- Error Alert from backend -->
                            <c:if test="${param.error == '1'}">
                                <div class="alert alert-danger" role="alert">
                                    ⚠️ There was a problem saving your listing. Please try again.
                                </div>
                            </c:if>

                            <div class="form-card">
                                <!-- Connects into AddTutorServlet via POST -->
                                <form action="addTutor" method="post">

                                    <!-- Tutor Info -->
                                    <div class="section-divider">👤 Tutor Information</div>
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">First Name *</label>
                                            <input type="text" class="form-control" name="firstName"
                                                placeholder="e.g. Priya" required />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Last Name *</label>
                                            <input type="text" class="form-control" name="lastName"
                                                placeholder="e.g. Fernando" required />
                                        </div>
                                    </div>
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Email Address *</label>
                                            <input type="email" class="form-control" name="email"
                                                placeholder="tutor@email.com" required />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Phone Number</label>
                                            <input type="text" class="form-control" name="phone"
                                                placeholder="07X XXX XXXX" />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label class="form-label">Short Bio</label>
                                        <textarea class="form-control" name="bio"
                                            placeholder="Brief description about the tutor's background and teaching style…"></textarea>
                                        <div class="form-hint">Max 300 characters</div>
                                    </div>

                                    <!-- Subject Info -->
                                    <div class="section-divider">📚 Subject Details</div>
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Subject Category *</label>
                                            <select class="form-select" name="category" required>
                                                <option value="">— Select Category —</option>
                                                <option value="Mathematics">Mathematics</option>
                                                <option value="Physics">Physics</option>
                                                <option value="Chemistry">Chemistry</option>
                                                <option value="Biology">Biology</option>
                                                <option value="IT / Computing">IT / Computing</option>
                                                <option value="English">English</option>
                                                <option value="Languages">Languages</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Hourly Rate (LKR) *</label>
                                            <input type="number" class="form-control" name="rate"
                                                placeholder="e.g. 1500" min="0" required />
                                        </div>
                                    </div>
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Teaching Level</label>
                                            <select class="form-select" name="teachingLevel">
                                                <option value="Primary (Grade 1–5)">Primary (Grade 1-5)</option>
                                                <option value="Junior Secondary (Grade 6–9)">Junior Secondary (Grade
                                                    6–9)
                                                </option>
                                                <option value="O/L (Grade 10–11)">O/L (Grade 10–11)</option>
                                                <option value="A/L (Grade 12–13)">A/L (Grade 12–13)</option>
                                                <option value="University / Higher">University / Higher</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Mode of Teaching</label>
                                            <select class="form-select" name="teachingMode">
                                                <option value="Online">Online</option>
                                                <option value="In-Person">In-Person</option>
                                                <option value="Both">Both</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label class="form-label">Subject Description</label>
                                        <textarea class="form-control" name="subjectDesc"
                                            placeholder="Describe what topics will be covered in this subject listing…"></textarea>
                                    </div>

                                    <!-- Status -->
                                    <div class="section-divider">⚙️ Listing Status</div>
                                    <div class="mb-4">
                                        <div class="d-flex gap-4">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="status"
                                                    id="statusActive" value="active" checked />
                                                <label class="form-check-label" for="statusActive">Active — Visible to
                                                    students</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="status"
                                                    id="statusInactive" value="inactive" />
                                                <label class="form-check-label" for="statusInactive">Inactive —
                                                    Hidden</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Buttons -->
                                    <div class="d-flex gap-3 flex-wrap">
                                        <button type="submit" class="btn btn-green px-4">✅ Save </button>
                                        <button type="reset" class="btn btn-outline-secondary px-4">🔄 Reset</button>
                                        <a href="listTutors" class="btn btn-outline-green px-4">← Back to Catalog</a>
                                    </div>
                                </form>

                            </div><!-- end form-card -->
                        </div>
                    </div>
                </div>
            </main>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </body>

        </html>