import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FALLBACK_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science',
  'History', 'Economics', 'Art', 'Music', 'French', 'Coding'
];

const numberFormatter = new Intl.NumberFormat();
const formatCount = value => numberFormatter.format(Number(value) || 0);
const subjectUrl = subject => `/tutors?subject=${encodeURIComponent(subject)}`;

const steps = [
  { icon: '🔎', title: 'Search & compare', desc: 'Browse verified tutors by subject, rate, profile details, reviews, and available lesson slots.' },
  { icon: '📅', title: 'Book a session', desc: 'Choose a suitable time from the tutor availability calendar and send a booking request.' },
  { icon: '✨', title: 'Learn & grow', desc: 'Attend your lesson, track sessions, manage payments, and share helpful feedback afterward.' },
];

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    api.get('/home/summary')
      .then(r => setSummary(r.data))
      .catch(() => setSummary({ stats: null, subjects: FALLBACK_SUBJECTS }))
      .finally(() => setLoadingSummary(false));
  }, []);

  const data = summary?.stats || {};
  const subjects = Array.isArray(summary?.subjects) ? summary.subjects : FALLBACK_SUBJECTS;
  const stats = [
    { icon: '👥', value: loadingSummary ? '…' : formatCount(data.activeStudents), label: 'Active students', tone: 'bg-cool' },
    { icon: '🎓', value: loadingSummary ? '…' : formatCount(data.expertTutors), label: 'Expert tutors', tone: 'bg-mint' },
    { icon: '📚', value: loadingSummary ? '…' : formatCount(data.subjectsCovered ?? subjects.length), label: 'Subjects covered', tone: 'bg-warm' },
    { icon: '🏆', value: loadingSummary ? '…' : `${Number(data.satisfactionRate) || 0}%`, label: 'Satisfaction rate', tone: 'bg-soft' },
  ];

  return (
    <div className="page home-page">
      <section className="home-hero-design">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <div className="ribbon">✨ #1 Tutor Marketplace</div>
            <h1>
              Learn from the <span className="text-gradient">best home tutors</span> near you
            </h1>
            <p>
              Connect with verified, expert tutors for personalised one-on-one classes. Book in minutes,
              learn at your pace, and stay in control of sessions, payments, and progress.
            </p>
            <div className="home-hero-actions">
              <Link to="/tutors" className="btn btn-primary btn-lg">🔍 Find a Tutor</Link>
              <Link to="/signup" className="btn btn-secondary btn-lg">Become a Tutor</Link>
            </div>
            <div className="home-trust-row">
              <span><i className="home-trust-dot" /> Verified tutors</span>
              <span>⭐ 4.9 average rating</span>
              <span>🛡️ Safe role-based platform</span>
            </div>
          </div>

          <div className="hero-showcase">
            <div className="hero-panel">
              <div className="ribbon-corner">Top rated</div>
              <div className="hero-stats-grid">
                {stats.map((item) => (
                  <div key={item.label} className={`hero-stat-tile ${item.tone}`}>
                    <div className="hero-stat-icon">{item.icon}</div>
                    <div className="hero-stat-number">{item.value}</div>
                    <div className="hero-stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <div className="ribbon ribbon-soft">Popular subjects</div>
            <h2>Find your next tutor by subject</h2>
            <p>Choose from high-demand school, university, language, and skill-based subjects.</p>
          </div>
          <div className="home-subject-grid">
            {subjects.map((subject) => (
              <Link key={subject} to={subjectUrl(subject)} className="home-subject-card">
                <div className="home-subject-icon">📘</div>
                <div className="home-subject-name">{subject}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <div className="home-section-header">
            <div className="ribbon ribbon-soft">How it works</div>
            <h2>Three steps to start learning</h2>
            <p>A simple marketplace flow for students, tutors, and admins.</p>
          </div>
          <div className="how-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="how-card">
                <div className="ribbon-corner">Step {index + 1}</div>
                <div className="how-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container">
          <div className="cta-panel">
            <div className="ribbon ribbon-soft" style={{ marginBottom: '1rem' }}>Ready for your next session?</div>
            <h2>Build confidence with a tutor who fits your goals.</h2>
            <p>
              Start browsing expert tutors now, or create a tutor profile and manage your subjects,
              availability, sessions, and earnings from one clean dashboard.
            </p>
            <div className="home-hero-actions" style={{ marginBottom: 0 }}>
              <Link to="/signup" className="btn btn-secondary btn-lg">Sign up free</Link>
              <Link to="/tutors" className="btn btn-outline-light btn-lg">Browse tutors</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
