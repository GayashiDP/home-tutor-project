import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ACTIONS = {
  Student: [
    { title: 'Browse Tutors', description: 'Search and compare tutors by subject, rating, and rate.', path: '/tutors', icon: '🎓', tone: 'blue' },
    { title: 'My Profile', description: 'Keep your student profile and preferences up to date.', path: '/profile', icon: '👤', tone: 'mint' },
    { title: 'My Sessions', description: 'View upcoming, past, and completed lesson sessions.', path: '/sessions', icon: '📚', tone: 'violet' },
    { title: 'Payments', description: 'View your transaction history and download receipts.', path: '/transactions', icon: '💳', tone: 'amber' },
  ],
  Tutor: [
    { title: 'My Profile', description: 'Update your public tutor bio and personal information.', path: '/profile', icon: '👤', tone: 'mint' },
    { title: 'Subjects', description: 'Add or manage the subjects you teach on the platform.', path: '/tutor/subjects', icon: '📖', tone: 'blue' },
    { title: 'Availability', description: 'Set your weekly bookable time slots for students.', path: '/tutor/availability', icon: '🗓️', tone: 'amber' },
    { title: 'Sessions', description: 'View upcoming and past student lesson sessions.', path: '/sessions', icon: '📚', tone: 'violet' },
  ],
  Admin: [
    { title: 'User Management', description: 'Review students, tutor earnings, and suspend tutor accounts.', path: '/admin/users', icon: '👥', tone: 'blue' },
    { title: 'Payment Approvals', description: 'Review uploaded payment slips and approve session payments.', path: '/admin/payments', icon: '💳', tone: 'amber' },
    { title: 'Review Moderation', description: 'Moderate student reviews and maintain platform quality.', path: '/admin/reviews', icon: '⭐', tone: 'violet' },
  ],
};

const ROLE_META = {
  Student: {
    label: 'Student workspace',
    headline: 'Plan your next lesson with confidence',
    description: 'Find expert tutors, manage upcoming lessons, and keep every payment receipt in one calm workspace.',
    heroIcon: '🌿',
    metrics: [
      ['Focus', 'Tutor discovery'],
      ['Next step', 'Book a session'],
      ['Tools', 'Sessions & receipts'],
    ],
  },
  Tutor: {
    label: 'Tutor studio',
    headline: 'Manage your teaching schedule beautifully',
    description: 'Refresh your profile, update subjects, open availability, and keep student sessions organized.',
    heroIcon: '📘',
    metrics: [
      ['Focus', 'Availability'],
      ['Next step', 'Open new slots'],
      ['Tools', 'Subjects & sessions'],
    ],
  },
  Admin: {
    label: 'Admin command center',
    headline: 'Keep the tutoring platform trusted',
    description: 'Review users, approve payments, and moderate feedback with a clean quality-control dashboard.',
    heroIcon: '🛡️',
    metrics: [
      ['Focus', 'Quality control'],
      ['Next step', 'Review queues'],
      ['Tools', 'Users, payments, reviews'],
    ],
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const actions = ACTIONS[user.role] || [];
  const meta = ROLE_META[user.role] || ROLE_META.Student;
  const displayName = user.name || user.fullName || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className={`page dashboard-page role-${String(user.role).toLowerCase()}`}>
      <div className="container section">
        <div className="dashboard-shell">
          <div className="dashboard-hero dashboard-hero-polished">
            <div className="dashboard-hero-copy">
              <div className="dashboard-kicker"><span>{meta.heroIcon}</span>{meta.label}</div>
              <h1>Hi, {firstName} 👋</h1>
              <p>{meta.description}</p>
              <div className="dashboard-hero-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(actions[0]?.path || '/profile')}>Start work</button>
                <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/profile')}>View profile</button>
              </div>
            </div>

            <div className="dashboard-profile-card">
              <div className="dashboard-profile-top">
                <div className="user-pill-avatar">{displayName.charAt(0)}</div>
                <div>
                  <strong>{displayName}</strong>
                  <span>{user.role}</span>
                </div>
              </div>
              <div className="dashboard-profile-email">{user.email || 'Profile ready'}</div>
              <div className="dashboard-profile-status">
                <span className="status-dot" /> Active workspace
              </div>
            </div>
          </div>

          <div className="dashboard-insights">
            {meta.metrics.map(([label, value], index) => (
              <div key={label} className="dashboard-insight-card">
                <div className="insight-number">0{index + 1}</div>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header dashboard-section-header">
            <div>
              <div className="ribbon ribbon-soft">{meta.headline}</div>
              <h2 className="section-title">Quick Actions</h2>
            </div>
          </div>

          <div className="action-grid action-grid-polished">
            {actions.map((a, index) => (
              <button key={a.path} className={`action-card action-card-${a.tone}`} onClick={() => navigate(a.path)}>
                <div className="action-card-topline">
                  <div className="action-icon">{a.icon}</div>
                  <span>0{index + 1}</span>
                </div>
                <strong>{a.title}</strong>
                <p>{a.description}</p>
                <div className="action-go">Open workspace →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
