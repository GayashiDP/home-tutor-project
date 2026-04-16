<%@ page contentType="text/html;charset=UTF-8" language="java" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HomeTutor — Find Your Perfect Tutor</title>

  <!-- Favicon -->
  <link rel="icon"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />

   <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css" />

  <script src="scripts.js"></script>
</head>

<body>

  <!-- ========== NAVBAR ========== -->
  <nav class="navbar navbar-expand-lg hts-navbar sticky-top">
    <div class="container">
      <a class="navbar-brand" href="index.jsp">
        <span class="logo-box">📚</span>
        HomeTutor
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav mx-auto gap-1">
          <li class="nav-item"><a class="nav-link active" href="index.jsp">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="tutor-catalog.jsp">Find Tutors</a></li>
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


  <!-- ========== HERO ========== -->
  <section class="hero-section py-5">
    <div class="container py-5 text-center position-relative" style="z-index:1;">
      <div class="hero-badge mb-3">🎓 &nbsp;Sri Lanka's Trusted Tutoring Platform</div>
      <h1 class="mb-3">Find Your Perfect<br /><span>Tutor Today</span></h1>
      <p class="lead mb-4 mx-auto" style="max-width:500px;">
        Connect with qualified tutors for personalized one-on-one learning in any subject, anytime.
      </p>

      <!-- Search Bar -->
      <div class="hero-search-bar mx-auto mb-5" style="max-width:520px;">
        <input type="text" placeholder="🔍  Search by subject or tutor name…" />
        <button onclick="window.location.href='tutor-catalog.jsp'">Search</button>
      </div>

      <!-- Stats -->
      <div class="row justify-content-center g-4">
        <div class="col-6 col-md-3">
          <div class="stat-num">500+</div>
          <div class="stat-lbl">Qualified Tutors</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-num">30+</div>
          <div class="stat-lbl">Subjects</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-num">2,000+</div>
          <div class="stat-lbl">Students</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-num">4.9 ★</div>
          <div class="stat-lbl">Avg. Rating</div>
        </div>
      </div>
    </div>
  </section>


  <!-- ========== HOW IT WORKS ========== -->
  <section class="py-5" style="background:#f0fdf4;">
    <div class="container">
      <div class="text-center section-heading mb-5">
        <h2>How It Works</h2>
        <p>Get started in just 3 easy steps</p>
        <div class="underline-bar"></div>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="step-card">
            <div class="step-icon-wrap">
              <div class="step-icon">🔍</div>
              <span class="step-badge">1</span>
            </div>
            <h5>Find a Tutor</h5>
            <p>Browse our catalog of verified tutors by subject, availability, and budget.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="step-card">
            <div class="step-icon-wrap">
              <div class="step-icon">📅</div>
              <span class="step-badge">2</span>
            </div>
            <h5>Book a Session</h5>
            <p>Pick a time slot from the tutor's calendar and confirm your booking instantly.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="step-card">
            <div class="step-icon-wrap">
              <div class="step-icon">🚀</div>
              <span class="step-badge">3</span>
            </div>
            <h5>Start Learning</h5>
            <p>Connect with your tutor and enjoy personalized lessons at your pace.</p>
          </div>
        </div>
      </div>
    </div>
  </section>


  <!-- ========== BROWSE SUBJECTS ========== -->
  <section class="py-5 bg-white">
    <div class="container">
      <div class="text-center section-heading mb-5">
        <h2>Browse by Subject</h2>
        <p>Explore tutors across all popular subjects</p>
        <div class="underline-bar"></div>
      </div>
      <div class="row g-3">
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">➗</div>
            <div class="s-name">Mathematics</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">⚗️</div>
            <div class="s-name">Chemistry</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">🔬</div>
            <div class="s-name">Biology</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">⚡</div>
            <div class="s-name">Physics</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">💻</div>
            <div class="s-name">IT / Computing</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">📖</div>
            <div class="s-name">English</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">🌐</div>
            <div class="s-name">Languages</div>
          </a>
        </div>
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <a href="listTutors" class="subject-chip">
            <div class="s-icon">📐</div>
            <div class="s-name">Engineering</div>
          </a>
        </div>
      </div>
    </div>
  </section>


  <!-- ========== FEATURED TUTORS ========== -->
  <section class="py-5 bg-white">
    <div class="container">
      <div class="text-center section-heading mb-5">
        <h2>Featured Tutors</h2>
        <p>Top-rated tutors our students love</p>
        <div class="underline-bar"></div>
      </div>
      <div class="row g-4">

        <div class="col-md-4">
          <div class="tutor-card">
            <div class="p-4 d-flex gap-3 align-items-start">
              <div class="tutor-avatar">👩‍🏫</div>
              <div>
                <div class="fw-bold">Ms. Priya Fernando</div>
                <div class="text-muted small">Mathematics · Physics</div>
                <div class="stars">★★★★★</div>
                <div class="t-rate">LKR 1,500 / hr</div>
              </div>
            </div>
            <div class="tutor-footer d-flex gap-2">
              <a href="tutor-details.jsp" class="btn btn-outline-green btn-sm">View Profile</a>
              <a href="booking.html" class="btn btn-green btn-sm">Book Now</a>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="tutor-card">
            <div class="p-4 d-flex gap-3 align-items-start">
              <div class="tutor-avatar">👨‍🔬</div>
              <div>
                <div class="fw-bold">Mr. Kamal Perera</div>
                <div class="text-muted small">Chemistry · Biology</div>
                <div class="stars">★★★★★</div>
                <div class="t-rate">LKR 1,200 / hr</div>
              </div>
            </div>
            <div class="tutor-footer d-flex gap-2">
              <a href="tutor-details.jsp" class="btn btn-outline-green btn-sm">View Profile</a>
              <a href="booking.html" class="btn btn-green btn-sm">Book Now</a>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="tutor-card">
            <div class="p-4 d-flex gap-3 align-items-start">
              <div class="tutor-avatar">👩‍💻</div>
              <div>
                <div class="fw-bold">Ms. Nisha Ratne</div>
                <div class="text-muted small">IT · Computing</div>
                <div class="stars">★★★★☆</div>
                <div class="t-rate">LKR 1,800 / hr</div>
              </div>
            </div>
            <div class="tutor-footer d-flex gap-2">
              <a href="tutor-details.jsp" class="btn btn-outline-green btn-sm">View Profile</a>
              <a href="booking.html" class="btn btn-green btn-sm">Book Now</a>
            </div>
          </div>
        </div>

      </div>
      <div class="text-center mt-4">
        <a href="listTutors" class="btn btn-outline-green btn-lg px-5">View All Tutors →</a>
      </div>
    </div>
  </section>


  <!-- ========== TESTIMONIALS ========== -->
  <section class="py-5" style="background:#f0fdf4;">
    <div class="container">
      <div class="text-center section-heading mb-5">
        <h2>What Students Say</h2>
        <p>Real experiences from our learners</p>
        <div class="underline-bar"></div>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="mb-4">Found an amazing Math tutor in minutes. My grades improved dramatically after just three
              sessions!</p>
            <div class="d-flex align-items-center gap-3">
              <div class="ta-avatar">A</div>
              <div>
                <div class="fw-semibold" style="font-size:.9rem;">Ashan Silva</div>
                <div class="text-muted" style="font-size:.8rem;">A/L Student</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="mb-4">The booking process is so simple. I love how easy it is to reschedule sessions when
              something comes up.</p>
            <div class="d-flex align-items-center gap-3">
              <div class="ta-avatar">R</div>
              <div>
                <div class="fw-semibold" style="font-size:.9rem;">Ruwani Jayawardena</div>
                <div class="text-muted" style="font-size:.8rem;">O/L Student</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="mb-4">Excellent tutors who explain concepts clearly and patiently. Worth every rupee I spent on
              lessons.</p>
            <div class="d-flex align-items-center gap-3">
              <div class="ta-avatar">D</div>
              <div>
                <div class="fw-semibold" style="font-size:.9rem;">Dinuka Bandara</div>
                <div class="text-muted" style="font-size:.8rem;">University Student</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  <!-- ========== CTA ========== -->
  <section class="cta-section py-5 text-white text-center">
    <div class="container py-4">
      <h2 class="fw-bold mb-3" style="font-size:2rem;">Ready to Start Learning?</h2>
      <p class="mb-4" style="opacity:.85;font-size:1rem;">Join thousands of students who improved their grades with
        HomeTutor.</p>
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <a href="signup.html" class="btn btn-white-green btn-lg px-5">Get Started Free</a>
        <a href="listTutors" class="btn btn-ghost-white btn-lg px-5">Browse Tutors</a>
      </div>
    </div>
  </section>


  <!-- ========== FOOTER ========== -->
  <footer class="hts-footer pt-5 pb-3">
    <div class="container">
      <div class="row g-4 pb-4 footer-divider border-bottom">
        <div class="col-lg-4">
          <a href="index.jsp" class="footer-logo">
            <span class="logo-box" style="background:#059669;">📚</span>
            HomeTutor
          </a>
          <p style="font-size:.87rem;line-height:1.75;">
            Connecting students with the best tutors for personalized learning experiences. Learn anytime, anywhere
            across Sri Lanka.
          </p>
        </div>
        <div class="col-6 col-lg-2 footer-col">
          <h6>Quick Links</h6>
          <ul>
            <li><a href="index.jsp">Home</a></li>
            <li><a href="listTutors">Find a Tutor</a></li>
            <li><a href="add-tutor.jsp">Add Subject</a></li>
            <li><a href="booking.html">Book a Session</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2 footer-col">
          <h6>Subjects</h6>
          <ul>
            <li><a href="listTutors">Mathematics</a></li>
            <li><a href="listTutors">Sciences</a></li>
            <li><a href="listTutors">Languages</a></li>
            <li><a href="listTutors">IT & Computing</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2 footer-col">
          <h6>Support</h6>
          <ul>
            <li><a href="support.html">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
          </ul>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center pt-3 footer-bottom-text flex-wrap gap-2">
        <span>© 2024 HomeTutor System. All rights reserved.</span>
        <span>SE1020 — Object Oriented Programming Project</span>
      </div>
    </div>
  </footer>



</body>

</html>