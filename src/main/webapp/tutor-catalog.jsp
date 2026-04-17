<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
    <%@ include file="header.jsp" %>

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
                                                <c:choose>
                                                    <c:when test="${not empty tutor.imagePath}">
                                                        <img src="${pageContext.request.contextPath}/${tutor.imagePath}"
                                                            alt="Avatar" class="tutor-avatar"
                                                            style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: none; padding: 0; background: transparent;" />
                                                    </c:when>
                                                    <c:otherwise>
                                                        <div class="tutor-avatar">👨‍🏫</div>
                                                    </c:otherwise>
                                                </c:choose>
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
                                        <div class="card-footer d-flex justify-content-center">
                                            <a href="tutorDetails?id=${tutor.id}"
                                                class="btn btn-outline-green btn-sm w-100">Details</a>
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
        <%@ include file="footer.jsp" %>