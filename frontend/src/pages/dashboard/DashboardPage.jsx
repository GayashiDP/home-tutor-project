import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const isTutor = role === 'Tutor';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const redirectPath = user.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell" aria-labelledby="dashboard-heading">
        <header className="dashboard-hero">
          <div>
            <p className="eyebrow">{role} Dashboard</p>
            <h1 id="dashboard-heading">Welcome, {user.name}</h1>
            <p className="dashboard-copy">
              Your account is secured with JWT authentication and ready for today’s tutoring workflow.
            </p>
          </div>
          <div className="dashboard-user-card">
            <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            <div>
              <strong>{user.role}</strong>
              <p>{user.email}</p>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <Link className="dashboard-action-card" to="/profile">
            <span>Profile</span>
            <strong>View and update your details</strong>
            <p>Keep your bio, contact information, and listing data current.</p>
          </Link>

          {isTutor ? (
            <Link className="dashboard-action-card" to="/tutor/subjects">
              <span>Subjects</span>
              <strong>Manage your tutor listing</strong>
              <p>Add subjects, describe grade levels, and remove inactive offerings.</p>
            </Link>
          ) : (
            <Link className="dashboard-action-card" to="/tutors">
              <span>Tutors</span>
              <strong>Find your next tutor</strong>
              <p>Search by tutor name or filter by subject to find the right match.</p>
            </Link>
          )}

          <div className="dashboard-action-card dashboard-status-card">
            <span>Session</span>
            <strong>Active</strong>
            <p>Use logout when you are done on this device.</p>
            <button type="button" className="danger-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
