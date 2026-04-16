<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
    <%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Tutor Catalog — HomeTutor</title>
            <link rel="icon"
                href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet" />
            <link rel="stylesheet" href="styles.css" />
        </head>

        <body>

            <!-- ========== NAVBAR ========== -->
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

                            <!-- Redirect to servlet instead of direct jsp to load dynamic data -->
                            <li class="nav-item"><a class="nav-link active" href="listTutors">Find Tutors</a></li>

                            <li class="nav-item"><a class="nav-link" href="schedule.html">Schedule</a></li>
                            <li class="nav-item"><a class="nav-link" href="booking.html">Bookings</a></li>
                            <li class="nav-item"><a class="nav-link" href="payments.html">Payments</a></li>
                            <li class="nav-item"><a class="nav-link" href="reviews.html">Reviews</a></li>

                            <!-- Admin-only nav link -->
                            <li class="nav-item admin-only">
                                <a class="nav-link" href="add-tutor.jsp"
                                    style="color:#059669 !important; font-weight:600;">
                                    + Add Subject
                                </a>
                            </li>
                        </ul>
                        <div class="d-flex gap-2 align-items-center mt-2 mt-lg-0">
                            <!-- Role badge shown when logged in -->
                            <span class="role-badge admin" id="roleBadge">👨‍💼 Admin</span>
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
                            <li class="breadcrumb-item active">Tutor Catalog</li>
                        </ol>
                    </nav>
                    <h1>Tutor Catalog</h1>
                    <p>Browse and connect with our verified tutors</p>
                </div>
            </div>

            <main class="page-bg py-4">
                <div class="container">

                    <!-- SUCCESS TOAST from Servlet redirect -->
                    <c:if test="${param.added == '1'}">
                        <div class="alert alert-success d-flex align-items-center" role="alert">
                            <div>✅ New tutor successfully added to database!</div>
                        </div>
                    </c:if>
                    <c:if test="${param.deleted == '1'}">
                        <div class="alert alert-warning d-flex align-items-center" role="alert">
                            <div>🗑️ Tutor removed successfully.</div>
                        </div>
                    </c:if>

                    <!-- SEARCH & FILTER BAR -->
                    <div class="search-wrap">
                        <div class="row g-3 align-items-end">
                            <div class="col-md-5">
                                <label class="form-label fw-semibold small mb-1">Search Tutors</label>
                                <input type="text" class="form-control" id="searchInput"
                                    placeholder="🔍  Search by name or subject…" oninput="filterTutors()" />
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold small mb-1">Subject</label>
                                <select class="form-select" id="subjectFilter" onchange="filterTutors()">
                                    <option value="">All Subjects</option>
                                    <option>Mathematics</option>
                                    <option>Physics</option>
                                    <option>Chemistry</option>
                                    <option>Biology</option>
                                    <option>IT / Computing</option>
                                    <option>English</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-semibold small mb-1">Status</label>
                                <select class="form-select" id="statusFilter" onchange="filterTutors()">
                                    <option value="">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <!-- ADMIN ONLY: Add tutor button -->
                            <div class="col-md-2 admin-only" style="display:block;">
                                <a href="add-tutor.jsp" class="btn btn-green w-100">+ Add Tutor</a>
                            </div>

                        </div>
                    </div>

                    <!-- TUTOR CARDS FROM DATABASE -->
                    <div class="row g-4 mt-2" id="tutorGrid">
                        <c:choose>
                            <c:when test="${not empty tutorsList}">
                                <c:forEach var="tutor" items="${tutorsList}">
                                    <div class="col-sm-6 col-lg-4 tutor-item"
                                        data-name="${tutor.firstName.toLowerCase()} ${tutor.lastName.toLowerCase()}"
                                        data-subject="${tutor.category.toLowerCase()}"
                                        data-status="${tutor.status.toLowerCase()}">
                                        <div class="t-card">
                                            <div class="card-body">
                                                <div class="d-flex gap-3 align-items-start mb-3">
                                                    <div class="tutor-avatar">👨‍🏫</div>
                                                    <div>
                                                        <div class="t-name">${tutor.firstName} ${tutor.lastName}</div>
                                                        <div class="t-sub">${tutor.category}</div>
                                                        <div class="stars">★★★★★</div>
                                                        <div class="t-rate">LKR ${tutor.rate} / hr</div>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span
                                                        class="t-badge ${tutor.status == 'active' ? 'active' : 'inactive'}">
                                                        ${tutor.status}
                                                    </span>
                                                    <small class="text-muted">${tutor.teachingLevel}</small>
                                                </div>
                                            </div>
                                            <div class="card-footer d-flex gap-2">
                                                <a href="tutorDetails?id=${tutor.id}"
                                                    class="btn btn-outline-green btn-sm">Details</a>

                                                <!-- Direct Delete Form to Servlet -->
                                                <form action="deleteTutor" method="post" class="ms-auto"
                                                    onsubmit="return confirm('Are you sure you want to permanently delete this tutor?');"
                                                    style="margin-bottom:0;">
                                                    <input type="hidden" name="id" value="${tutor.id}" />
                                                    <button type="submit" class="btn btn-danger-soft btn-sm">🗑️
                                                        Delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </c:forEach>
                            </c:when>
                            <c:otherwise>
                                <!-- Fallback if database is empty -->
                                <div class="col-12 mt-4 text-center">
                                    <div style="font-size:3rem; margin-bottom:1rem;">📭</div>
                                    <h5>No Tutors Found!</h5>
                                    <p class="text-muted">There are currenty no tutors in the database. Please add one
                                        using the + Add Tutor button.</p>
                                    <a href="add-tutor.jsp" class="btn btn-green mt-3">+ Add New Tutor</a>
                                </div>
                            </c:otherwise>
                        </c:choose>
                    </div>

                </div>
            </main>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            <script src="scripts.js"></script>
        </body>

        </html>