import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const redirectPath = user.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-panel" aria-labelledby="dashboard-heading">
        <p className="eyebrow">{role} Dashboard</p>
        <h1 id="dashboard-heading">Welcome, {user.name}</h1>
        <p className="dashboard-copy">
          You are signed in as {user.role}. Your session is active on this device.
        </p>
        <Link className="secondary-link-button" to="/profile">
          View Profile
        </Link>
        <button type="button" className="primary-button dashboard-logout" onClick={logout}>
          Logout
        </button>
      </section>
    </main>
  );
}
