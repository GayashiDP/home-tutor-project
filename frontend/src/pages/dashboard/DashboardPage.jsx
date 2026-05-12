import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const isTutor = role === 'Tutor';
  const quickStats = isTutor
    ? [
        { label: 'Listing', value: 'Live', detail: 'Tutor profile active' },
        { label: 'Schedule', value: 'Weekly', detail: 'Manage bookable slots' },
        { label: 'Bookings', value: 'Pending', detail: 'Review student requests' },
      ]
    : [
        { label: 'Catalog', value: 'Open', detail: 'Search tutors by subject' },
        { label: 'Bookings', value: 'Ready', detail: 'Pick green availability slots' },
        { label: 'Session', value: 'Secure', detail: 'JWT protected account' },
      ];

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
              Manage your tutoring workflow from one place with secure account access and live API-backed data.
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

        <section className="dashboard-metrics" aria-label="Dashboard summary">
          {quickStats.map((item) => (
            <article className="dashboard-metric-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <div className="dashboard-grid">
          <Link className="dashboard-action-card" to="/profile">
            <span>Profile</span>
            <strong>View and update your details</strong>
            <p>Keep your bio, contact information, and listing data current.</p>
          </Link>

          {isTutor ? (
            <>
              <Link className="dashboard-action-card" to="/tutor/subjects">
                <span>Subjects</span>
                <strong>Manage your tutor listing</strong>
                <p>Add subjects, describe grade levels, and remove inactive offerings.</p>
              </Link>
              <Link className="dashboard-action-card" to="/tutor/availability">
                <span>Availability</span>
                <strong>Set your weekly schedule</strong>
                <p>Mark hourly slots students can book and keep your calendar current.</p>
              </Link>
            </>
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
