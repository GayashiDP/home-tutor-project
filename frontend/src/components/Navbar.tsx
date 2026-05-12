import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <div className="app-navbar-row">
          <Link to="/" className="app-navbar-brand">
            <span className="app-navbar-mark">HT</span>
            <span>Home Tutor</span>
          </Link>

          <div className="app-navbar-links">
            <Link to="/" className="app-navbar-link">
              Home
            </Link>
            <Link to="/tutors" className="app-navbar-link">
              Browse Tutors
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="app-navbar-link">
                  Dashboard
                </Link>
                <Link to="/sessions" className="app-navbar-link">
                  Sessions
                </Link>
                {user.role === 'Student' && (
                  <Link to="/transactions" className="app-navbar-link">
                    Payments
                  </Link>
                )}
                {user.role === 'Tutor' && (
                  <>
                    <Link to="/tutor/subjects" className="app-navbar-link">
                      Subjects
                    </Link>
                    <Link to="/tutor/availability" className="app-navbar-link">
                      Availability
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="app-navbar-danger"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="app-navbar-link"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="app-navbar-cta"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="app-navbar-menu"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {isMenuOpen && (
          <div className="app-navbar-mobile">
            <Link
              to="/"
              className="app-navbar-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/tutors"
              className="app-navbar-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Tutors
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="app-navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/sessions"
                  className="app-navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sessions
                </Link>
                {user.role === 'Student' && (
                  <Link
                    to="/transactions"
                    className="app-navbar-mobile-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Payments
                  </Link>
                )}
                {user.role === 'Tutor' && (
                  <>
                    <Link
                      to="/tutor/subjects"
                      className="app-navbar-mobile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Subjects
                    </Link>
                    <Link
                      to="/tutor/availability"
                      className="app-navbar-mobile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Availability
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="app-navbar-mobile-danger"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="app-navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="app-navbar-mobile-cta"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
