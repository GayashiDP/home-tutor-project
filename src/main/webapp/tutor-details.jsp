<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
  <%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Subject Details — HomeTutor</title>
      <link rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="styles.css" />

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
              <li class="nav-item"><a class="nav-link active" href="listTutors">Find Tutors</a></li>
              <li class="nav-item"><a class="nav-link" href="schedule.html">Schedule</a></li>
              <li class="nav-item"><a class="nav-link" href="booking.html">Bookings</a></li>
              <li class="nav-item"><a class="nav-link" href="payments.html">Payments</a></li>
              <li class="nav-item"><a class="nav-link" href="reviews.html">Reviews</a></li>
            </ul>
            <div class="d-flex gap-2">
              <a href="login.html" class="btn btn-outline-green btn-sm">Login</a>
              <a href="signup.html" class="btn btn-green btn-sm">Sign Up</a>
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
              <li class="breadcrumb-item active">Tutor Details</li>
            </ol>
          </nav>
          <h1>Tutor Details</h1>
          <p>View and manage this tutor's listing</p>
        </div>
      </div>

      <main class="page-bg py-5">
        <div class="container">

          <!-- SUCCESS TOAST -->
          <div class="toast-success" id="successToast">
            ✅ <span id="toastMsg">Changes saved successfully.</span>
          </div>

          <div class="row g-4">

            <!-- LEFT: Tutor info card -->
            <div class="col-lg-4">
              <div class="detail-card mb-4">
                <div class="detail-header text-center">
                  <div style="font-size:3.5rem;margin-bottom:12px;">👩‍🏫</div>
                  <h4 class="fw-bold mb-1">${tutor.firstName} ${tutor.lastName}</h4>
                  <div class="stars mb-1">★★★★★</div>
                  <div style="opacity:.85;font-size:.9rem;">${tutor.category}</div>
                  <span
                    class="t-badge ${tutor.status == 'active' ? 'active' : 'inactive'} mt-2 d-inline-block">${tutor.status}</span>
                </div>
                <div class="detail-body">
                  <div class="info-row">
                    <span class="info-label">Hourly Rate</span>
                    <span class="info-value">LKR ${tutor.rate}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Students</span>
                    <span class="info-value">New</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Mode</span>
                    <span class="info-value">${tutor.teachingMode}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Level</span>
                    <span class="info-value">${tutor.teachingLevel}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Joined</span>
                    <span class="info-value">Jan 2024</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-grid gap-2">
                <button class="btn btn-green" data-bs-toggle="modal" data-bs-target="#editModal">
                  ✏️ Edit Details
                </button>
                <a href="booking.html" class="btn btn-outline-green">
                  📅 Book This Tutor
                </a>
                <button class="btn btn-danger-soft"
                  onclick="document.getElementById('deleteSection').scrollIntoView({behavior:'smooth'})">
                  🗑️ Remove Tutor
                </button>
                <a href="listTutors" class="btn btn-outline-secondary">
                  ← Back to Catalog
                </a>
              </div>
            </div>

            <!-- RIGHT: Details -->
            <div class="col-lg-8">

              <!-- Subjects taught -->
              <div class="detail-card mb-4">
                <div class="detail-body">
                  <h6 class="fw-bold mb-3" style="color:#064e3b;">📚 Subjects Taught</h6>
                  <span class="subject-tag">${tutor.category}</span>
                  <p class="mt-3 text-muted" style="font-size:0.9rem;">${tutor.subjectDesc}</p>
                  <hr style="border-color:#d1fae5;" class="my-4" />
                  <h6 class="fw-bold mb-3" style="color:#064e3b;">👤 About the Tutor</h6>
                  <p style="font-size:.92rem;color:#374151;line-height:1.75;">
                    ${tutor.bio}
                  </p>
                  <hr style="border-color:#d1fae5;" class="my-4" />
                  <h6 class="fw-bold mb-3" style="color:#064e3b;">📞 Contact Information</h6>
                  <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${tutor.email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone</span>
                    <span class="info-value">${tutor.phone}</span>
                  </div>
                </div>
              </div>

              <!-- Delete zone -->
              <div class="detail-card" id="deleteSection" style="border: 2px solid #fee2e2;">
                <div class="detail-body">
                  <h6 class="fw-bold mb-2" style="color:#dc2626;">⚠️ Remove This Listing</h6>
                  <p class="text-muted small mb-3">
                    Removing this listing will make it invisible to all students. This action cannot be undone.
                  </p>
                  <button class="btn btn-danger btn-sm px-4" data-bs-toggle="modal" data-bs-target="#deleteModal">
                    🗑️ Remove Listing
                  </button>
                </div>
              </div>

            </div>
          </div><!-- end row -->
        </div>
      </main>


      <!-- EDIT MODAL (Update) -->
      <div class="modal fade" id="editModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">✏️ Edit Listing</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-500 small">First Name</label>
                  <input type="text" class="form-control" value="${tutor.firstName}" id="editFirst" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Last Name</label>
                  <input type="text" class="form-control" value="${tutor.lastName}" id="editLast" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Subject Category</label>
                  <select class="form-select" id="editCategory">
                    <option selected>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>IT / Computing</option>
                    <option>English</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Hourly Rate (LKR)</label>
                  <input type="number" class="form-control" value="1500" id="editRate" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Teaching Level</label>
                  <select class="form-select" id="editLevel">
                    <option>O/L (Grade 10–11)</option>
                    <option>A/L (Grade 12–13)</option>
                    <option>University / Higher</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Status</label>
                  <select class="form-select" id="editStatus">
                    <option value="active" selected>Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-500 small">Bio</label>
                  <textarea class="form-control" id="editBio"
                    rows="3">Ms. Priya Fernando is a highly experienced mathematics and physics tutor with over 8 years of teaching experience.</textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-green btn-sm px-4" onclick="saveEdit()">💾 Save Changes</button>
            </div>
          </div>
        </div>
      </div>


      <!-- DELETE CONFIRM MODAL -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">Confirm Remove</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body py-4 text-center">
              <div style="font-size:2.5rem;margin-bottom:12px;">🗑️</div>
              <p class="mb-1">Are you sure you want to remove</p>
              <p class="fw-bold">${tutor.firstName} ${tutor.lastName}</p>
              <p class="text-muted small">from the catalog? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-danger btn-sm px-4" onclick="deleteListing()">Yes, Remove</button>
            </div>
          </div>
        </div>
      </div>


      <!-- FOOTER -->
      <footer class="hts-footer pt-5 pb-3">
        <div class="container">
          <div class="row g-4 pb-4 border-bottom footer-divider">
            <div class="col-lg-4">
              <a href="index.jsp" class="footer-logo"><span class="logo-box">📚</span> HomeTutor</a>
              <p>Connecting students with the best tutors for personalized learning across Sri Lanka.</p>
            </div>
            <div class="col-6 col-lg-2">
              <h6>Quick Links</h6>
              <ul>
                <li><a href="index.jsp">Home</a></li>
                <li><a href="listTutors">Find a Tutor</a></li>
                <li><a href="add-tutor.jsp">Add Subject</a></li>
              </ul>
            </div>
            <div class="col-6 col-lg-3">
              <h6>Subjects</h6>
              <ul>
                <li><a href="#">Mathematics</a></li>
                <li><a href="#">Sciences</a></li>
                <li><a href="#">IT &amp; Computing</a></li>
              </ul>
            </div>
            <div class="col-6 col-lg-3">
              <h6>Support</h6>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div class="d-flex justify-content-between flex-wrap gap-2 pt-3">
            <span class="footer-copy">© 2024 HomeTutor System. All rights reserved.</span>
            <span class="footer-copy">SE1020 — OOP Project</span>
          </div>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      <script src="scripts.js"></script>
    </body>

    </html>