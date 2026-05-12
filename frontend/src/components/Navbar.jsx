import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from './BrandLogo';
import { useTheme } from '../hooks/useTheme';

function NavIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
    moon: (<><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7 7 0 1 0 11 11Z" /></>),
    user: (<><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>),
    logout: (<><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /><path d="M14 21h5a2 2 0 0 0 2-2" /></>),
    chevron: (<path d="m6 9 6 6 6-6" />),
    dashboard: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>),
    home: (<><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>),
    tutors: (<><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>),
    sessions: (<><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M16 3v4M8 3v4M4 11h16" /></>),
    payments: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>),
    subjects: (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /></>),
    availability: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m9 16 2 2 4-5" /></>),
    users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
    reviews: (<><path d="m12 3 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.8l-5.8 3.06 1.11-6.46-4.7-4.58 6.49-.94L12 3Z" /></>),
    login: (<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>),
    signup: (<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></>),
    menu: (<><path d="M4 7h16M4 12h16M4 17h16" /></>),
    close: (<><path d="M18 6 6 18M6 6l12 12" /></>),
    pin: (<><path d="M12 17v5" /><path d="M5 17h14" /><path d="M9 17 8 8 5 5V3h14v2l-3 3-1 9" /></>),
  };

  return <svg {...common}>{paths[name] || paths.home}</svg>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const close = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (accountRef.current?.contains(event.target)) return;
      setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  const canBrowseTutors = !user || user.role === 'Student';
  const commonLinks = [
    { label: 'Home', to: '/', icon: 'home' },
    ...(canBrowseTutors ? [{ label: 'Browse Tutors', to: '/tutors', icon: 'tutors' }] : []),
  ];
  const authLinks = user ? [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    ...(user.role !== 'Admin' ? [{ label: 'Sessions', to: '/sessions', icon: 'sessions' }] : []),
    ...(user.role === 'Student' ? [{ label: 'Payments', to: '/transactions', icon: 'payments' }] : []),
    ...(user.role === 'Tutor' ? [
      { label: 'Subjects', to: '/tutor/subjects', icon: 'subjects' },
      { label: 'Availability', to: '/tutor/availability', icon: 'availability' },
    ] : []),
    ...(user.role === 'Admin' ? [
      { label: 'Users', to: '/admin/users', icon: 'users' },
      { label: 'Payments', to: '/admin/payments', icon: 'payments' },
      { label: 'Reviews', to: '/admin/reviews', icon: 'reviews' },
    ] : []),
  ] : [];

  const allLinks = [...commonLinks, ...authLinks];
  const displayName = user?.name || user?.fullName || user?.email || 'User';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const renderThemeToggle = () => (
    <button
      type="button"
      className="app-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <NavIcon name={theme === 'dark' ? 'sun' : 'moon'} />
      </span>
      <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );

  const renderAccountMenu = () => {
    if (!user) return null;
    return (
      <div className="app-account" ref={accountRef}>
        <button
          type="button"
          className="app-account-trigger app-profile-top-trigger"
          onClick={() => setAccountOpen(current => !current)}
          aria-haspopup="menu"
          aria-expanded={accountOpen}
        >
          <span className="app-account-avatar">{initial}</span>
          <span className="app-account-text">
            <strong>{firstName}</strong>
            <small>{user.role}</small>
          </span>
          <span className="app-account-chevron"><NavIcon name="chevron" /></span>
        </button>

        {accountOpen && (
          <div className="app-account-menu" role="menu">
            <div className="app-account-menu-header">
              <button type="button" className="app-account-close" aria-label="Close profile menu" onClick={() => setAccountOpen(false)}>×</button>
              <div className="app-account-email">{user.email || 'Profile account'}</div>
              <div className="app-account-big-avatar">{initial}</div>
              <h3>Hi, {firstName}!</h3>
              <span className="app-account-role">{user.role} account</span>
            </div>

            <div className="app-account-actions">
              <Link to="/profile" className="app-account-action" role="menuitem" onClick={close}>
                <span className="app-account-action-icon"><NavIcon name="user" /></span>
                <span>Profile Management</span>
              </Link>
              <Link to="/dashboard" className="app-account-action" role="menuitem" onClick={close}>
                <span className="app-account-action-icon"><NavIcon name="dashboard" /></span>
                <span>Dashboard</span>
              </Link>
              <button type="button" className="app-account-action app-account-logout" role="menuitem" onClick={handleLogout}>
                <span className="app-account-action-icon"><NavIcon name="logout" /></span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSidebarLinks = () => (
    <div className="app-sidebar-nav" role="list">
      {allLinks.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={close}
          title={link.label}
          role="listitem"
        >
          <span className="app-sidebar-link-icon"><NavIcon name={link.icon} /></span>
          <span className="app-sidebar-link-label">{link.label}</span>
        </NavLink>
      ))}
    </div>
  );

  const renderAuthActions = () => (
    <div className="app-top-auth-actions">
      <Link to="/login" className="app-top-link" onClick={close}><NavIcon name="login" /> Login</Link>
      <Link to="/signup" className="app-navbar-cta" onClick={close}><NavIcon name="signup" /> Get Started</Link>
    </div>
  );

  return (
    <nav className="app-navbar app-shell-nav" aria-label="Primary navigation">
      <aside
        className={`app-sidebar ${open ? 'mobile-open' : ''}`}
        data-pinned={sidebarPinned ? 'true' : 'false'}
      >
        <div className="app-sidebar-brand-row">
          <Link to="/" className="app-sidebar-brand" onClick={close} aria-label="Home Tutor home">
            <BrandLogo className="app-navbar-logo app-sidebar-logo" />
            <span className="app-sidebar-brand-text">
              <strong>Home Tutor</strong>
              <small>Learning Marketplace</small>
            </span>
          </Link>
          <button
            type="button"
            className="app-sidebar-pin"
            onClick={() => setSidebarPinned(current => !current)}
            aria-label={sidebarPinned ? 'Auto-hide sidebar' : 'Keep sidebar open'}
            title={sidebarPinned ? 'Auto-hide sidebar' : 'Keep sidebar open'}
          >
            <NavIcon name={sidebarPinned ? 'close' : 'pin'} />
          </button>
        </div>

        {renderSidebarLinks()}

        <div className="app-sidebar-footer">
          {user ? (
            <Link to="/profile" className="app-sidebar-profile" onClick={close} title="Profile Management">
              <span className="app-account-avatar">{initial}</span>
              <span className="app-sidebar-profile-copy">
                <strong>{firstName}</strong>
                <small>{user.role} profile</small>
              </span>
            </Link>
          ) : (
            <div className="app-sidebar-guest-card">
              <strong>Ready to learn?</strong>
              <small>Join tutors and students in one calm workspace.</small>
            </div>
          )}
        </div>
      </aside>

      {open && <button type="button" className="app-sidebar-backdrop" aria-label="Close navigation menu" onClick={() => setOpen(false)} />}

      <div className="app-top-actions">
        <button
          onClick={() => setOpen(current => !current)}
          className="mobile-menu-btn app-sidebar-mobile-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          type="button"
        >
          <NavIcon name={open ? 'close' : 'menu'} />
        </button>

        {renderThemeToggle()}
        {user ? renderAccountMenu() : renderAuthActions()}
      </div>
    </nav>
  );
}
