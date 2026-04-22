<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
  <%@ include file="header.jsp" %>

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
                <c:choose>
                  <c:when test="${not empty tutor.imagePath}">
                    <img src="${pageContext.request.contextPath}/${tutor.imagePath}" alt="${tutor.firstName}'s Image"
                      style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;" />
                  </c:when>
                  <c:otherwise>
                    <div style="font-size:3.5rem;margin-bottom:12px;">👩‍🏫</div>
                  </c:otherwise>
                </c:choose>
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
                <h6 class="fw-bold mb-2" style="color:#dc2626;">⚠️ Remove This Tutor</h6>
                <p class="text-muted small mb-3">
                  Removing this Tutor will make it invisible to all students. This action cannot be undone.
                </p>
                <button class="btn btn-danger btn-sm px-4" data-bs-toggle="modal" data-bs-target="#deleteModal">
                  🗑️ Remove Tutor
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
          <form action="updateTutor" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="${tutor.id}" />
            <div class="modal-header">
              <h5 class="modal-title fw-bold">✏️ Edit Listing</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-500 small">First Name</label>
                  <input type="text" class="form-control" name="firstName" value="${tutor.firstName}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Last Name</label>
                  <input type="text" class="form-control" name="lastName" value="${tutor.lastName}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Email</label>
                  <input type="email" class="form-control" name="email" value="${tutor.email}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Phone</label>
                  <input type="text" class="form-control" name="phone" value="${tutor.phone}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Subject Category</label>
                  <select class="form-select" name="category" required>
                    <option value="Mathematics" ${tutor.category=='Mathematics' ? 'selected' : '' }>Mathematics
                    </option>
                    <option value="Physics" ${tutor.category=='Physics' ? 'selected' : '' }>Physics</option>
                    <option value="Chemistry" ${tutor.category=='Chemistry' ? 'selected' : '' }>Chemistry</option>
                    <option value="Biology" ${tutor.category=='Biology' ? 'selected' : '' }>Biology</option>
                    <option value="IT / Computing" ${tutor.category=='IT / Computing' ? 'selected' : '' }>IT /
                      Computing</option>
                    <option value="English" ${tutor.category=='English' ? 'selected' : '' }>English</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Hourly Rate (LKR)</label>
                  <input type="number" step="0.01" class="form-control" name="rate" value="${tutor.rate}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Teaching Level</label>
                  <select class="form-select" name="teachingLevel" required>
                    <option value="Primary(Grade 1–5)" ${tutor.teachingLevel=='Primary(Grade 1–5)' ? 'selected' : '' }>
                      Primary(Grade 1–5)</option>
                    <option value="Junior Secondary(Grade 6–9)" ${tutor.teachingLevel=='Junior Secondary(Grade 6–9)'
                      ? 'selected' : '' }>
                      Junior Secondary(Grade 6–9)</option>
                    <option value="O/L (Grade 10–11)" ${tutor.teachingLevel=='O/L (Grade 10–11)' ? 'selected' : '' }>
                      O/L (Grade 10–11)</option>
                    <option value="A/L (Grade 12–13)" ${tutor.teachingLevel=='A/L (Grade 12–13)' ? 'selected' : '' }>
                      A/L (Grade 12–13)</option>
                    <option value="University / Higher" ${tutor.teachingLevel=='University / Higher' ? 'selected' : ''
                      }>University / Higher</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Teaching Mode</label>
                  <select class="form-select" name="teachingMode" required>
                    <option value="Online" ${tutor.teachingMode=='Online' ? 'selected' : '' }>Online</option>
                    <option value="Physical" ${tutor.teachingMode=='Physical' ? 'selected' : '' }>Physical</option>
                    <option value="Both" ${tutor.teachingMode=='Both' ? 'selected' : '' }>Both</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-500 small">Status</label>
                  <select class="form-select" name="status" required>
                    <option value="active" ${tutor.status=='active' ? 'selected' : '' }>Active</option>
                    <option value="inactive" ${tutor.status=='inactive' ? 'selected' : '' }>Inactive</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-500 small">Subjects Description</label>
                  <textarea class="form-control" name="subjectDesc" rows="2" required>${tutor.subjectDesc}</textarea>
                </div>
                <div class="col-12">
                  <label class="form-label fw-500 small">Bio</label>
                  <textarea class="form-control" name="bio" rows="3" required>${tutor.bio}</textarea>
                </div>
                <div class="col-12">
                  <label class="form-label fw-500 small">Update Image (Optional)</label>
                  <input type="file" class="form-control" name="image" accept="image/*" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-green btn-sm px-4">💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>


    <!-- DELETE CONFIRM MODAL -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form action="deleteTutor" method="post">
            <input type="hidden" name="id" value="${tutor.id}" />
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
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-danger btn-sm px-4">Yes, Remove</button>
            </div>
          </form>
        </div>
      </div>
    </div>


    <%@ include file="footer.jsp" %>