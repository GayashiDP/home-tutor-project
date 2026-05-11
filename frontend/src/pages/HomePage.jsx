import { Link } from 'react-router-dom';
import bgImage from '../assets/images/background.jpg';
import logoImage from '../assets/images/logo.png';

export default function HomePage() {
  return (
    <div className="home-root">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="home-hero" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="home-hero-overlay" />

        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src={logoImage} alt="Home Tutor" className="home-logo" />
          </Link>
          <div className="home-nav-links">
            <Link to="/login" className="nav-link-ghost">Log In</Link>
            <Link to="/signup" className="nav-btn-primary">Get Started Free</Link>
          </div>
        </nav>

        <div className="home-hero-content">
          <span className="home-badge">🇱🇰 Sri Lanka's #1 Home Tutoring Platform</span>
          <h1 className="home-title">
            Learn Smarter.<br />Grow Faster.
          </h1>
          <p className="home-subtitle">
            Connect with verified, expert tutors for personalized one-on-one lessons —
            at home, on your schedule, at your pace.
          </p>
          <div className="home-cta-group">
            <Link to="/signup" className="cta-btn-primary">Find a Tutor →</Link>
            <Link to="/signup?role=Tutor" className="cta-btn-ghost">Become a Tutor</Link>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <section className="home-stats">
        {[
          { value: '500+', label: 'Verified Tutors' },
          { value: '2,000+', label: 'Happy Students' },
          { value: '15+', label: 'Subjects Covered' },
          { value: '4.9 ★', label: 'Average Rating' },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="home-section">
        <p className="section-eyebrow">Simple Process</p>
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Three simple steps to start your learning journey</p>
        <div className="steps-grid">
          {[
            { n: '01', icon: '🔍', title: 'Find Your Tutor', desc: 'Browse profiles, read reviews, and choose the perfect tutor for your subject and level.' },
            { n: '02', icon: '📅', title: 'Book a Session', desc: 'Pick a time that suits you. Your tutor comes to your home or connects online.' },
            { n: '03', icon: '🚀', title: 'Start Learning', desc: 'Enjoy personalized lessons tailored exactly to your goals and learning style.' },
          ].map((step) => (
            <div key={step.n} className="step-card">
              <span className="step-number">{step.n}</span>
              <span className="step-icon">{step.icon}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Subjects ─────────────────────────────── */}
      <section className="home-section home-section-alt">
        <p className="section-eyebrow">Explore</p>
        <h2 className="section-title">Popular Subjects</h2>
        <div className="subjects-grid">
          {['Mathematics','Science','English','Physics','Chemistry','Biology','History','ICT','Commerce','Tamil','Sinhala','Art'].map((s) => (
            <Link to="/signup" key={s} className="subject-pill">{s}</Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="home-section">
        <p className="section-eyebrow">Student Stories</p>
        <h2 className="section-title">What Our Students Say</h2>
        <div className="testimonials-grid">
          {[
            { name: 'Kavindi P.', role: 'A/L Student', text: 'My Chemistry grades went from C to A within 3 months. The tutor was amazing and so patient!', avatar: 'K' },
            { name: 'Ravindu S.', role: 'O/L Student', text: 'Finding a Math tutor used to be stressful. Now I just log in and book in minutes. Love it!', avatar: 'R' },
            { name: 'Amara J.', role: 'Grade 8 Student', text: 'My English improved so much. The home sessions are way better than going to class after school.', avatar: 'A' },
          ].map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="home-cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of students achieving their academic goals with Home Tutor.</p>
          <div className="cta-banner-btns">
            <Link to="/signup" className="cta-btn-primary">Create Free Account</Link>
            <Link to="/login" className="cta-btn-outline">Log In</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="home-footer">
        <img src={logoImage} alt="Home Tutor" className="footer-logo" />
        <p>© 2025 Home Tutor. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/login">Log In</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
