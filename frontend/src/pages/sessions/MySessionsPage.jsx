import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { cancelBooking, getMySessions } from '../../services/bookingService';

const tabs = ['Upcoming', 'Past'];

const formatDateTime = (session) => {
  const date = new Date(`${session.sessionDate}T00:00:00`);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const time = session.startTime && session.endTime
    ? `${session.startTime}-${session.endTime}`
    : 'Time unavailable';

  return `${formattedDate} · ${time}`;
};

const isPastSession = (session) => {
  if (['Completed', 'Cancelled'].includes(session.status)) {
    return true;
  }

  const endTime = session.endTime || '23:59';
  return new Date(`${session.sessionDate}T${endTime}:00`) < new Date();
};

export default function MySessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMySessions();
      setSessions(response.data.sessions || []);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load sessions'
        : 'Unable to load sessions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      queueMicrotask(loadSessions);
    }
  }, [loadSessions, user]);

  const groupedSessions = useMemo(() => {
    const upcoming = [];
    const past = [];

    sessions.forEach((session) => {
      if (isPastSession(session)) {
        past.push(session);
      } else {
        upcoming.push(session);
      }
    });

    upcoming.sort((a, b) => new Date(`${a.sessionDate}T${a.startTime || '00:00'}:00`) - new Date(`${b.sessionDate}T${b.startTime || '00:00'}:00`));
    past.sort((a, b) => new Date(`${b.sessionDate}T${b.startTime || '00:00'}:00`) - new Date(`${a.sessionDate}T${a.startTime || '00:00'}:00`));

    return { Upcoming: upcoming, Past: past };
  }, [sessions]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = user.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard';
  const visibleSessions = groupedSessions[selectedTab];
  const participantLabel = user.role === 'Tutor' ? 'Student' : 'Tutor';
  const canCancelSelectedSession = Boolean(
    selectedSession
      && user.role === 'Student'
      && !isPastSession(selectedSession)
      && ['Pending', 'Confirmed'].includes(selectedSession.status),
  );
  const canPaySelectedSession = Boolean(
    selectedSession
      && user.role === 'Student'
      && selectedSession.status === 'Pending'
      && !isPastSession(selectedSession),
  );

  const handleCancelBooking = async () => {
    if (!sessionToCancel) {
      return;
    }

    try {
      setCancelling(true);
      setActionError('');
      const response = await cancelBooking(sessionToCancel.id);
      const cancelledSession = response.data.session;
      setSessions((current) => current.map((session) => (
        session.id === cancelledSession.id ? cancelledSession : session
      )));
      setSelectedSession(cancelledSession);
      setSessionToCancel(null);
      setSelectedTab('Past');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to cancel booking'
        : 'Unable to cancel booking';
      setActionError(message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="sessions-page">
      <Navbar />

      <section className="sessions-shell" aria-labelledby="sessions-heading">
        <div className="profile-topbar">
          <Link to={dashboardPath}>Back to Dashboard</Link>
          <Link to={user.role === 'Student' ? '/tutors' : '/tutor/availability'}>
            {user.role === 'Student' ? 'Find Tutors' : 'Availability'}
          </Link>
        </div>

        <header className="subject-manager-header">
          <p className="eyebrow">Lesson Tracker</p>
          <h1 id="sessions-heading">My Sessions</h1>
          <p>Review upcoming requests, confirmed lessons, and past session history.</p>
        </header>

        <section className="sessions-summary" aria-label="Session summary">
          <article>
            <span>Upcoming</span>
            <strong>{groupedSessions.Upcoming.length}</strong>
          </article>
          <article>
            <span>Past</span>
            <strong>{groupedSessions.Past.length}</strong>
          </article>
          <article>
            <span>Total</span>
            <strong>{sessions.length}</strong>
          </article>
        </section>

        <div className="sessions-tabs" role="tablist" aria-label="Session groups">
          {tabs.map((tab) => (
            <button
              type="button"
              className={selectedTab === tab ? 'sessions-tab active' : 'sessions-tab'}
              key={tab}
              onClick={() => setSelectedTab(tab)}
              role="tab"
              aria-selected={selectedTab === tab}
            >
              {tab}
              <span>{groupedSessions[tab].length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="soft-empty-state">
            <span className="mini-spinner" />
            <p>Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="sessions-error">
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={loadSessions}>
              Try Again
            </button>
          </div>
        ) : visibleSessions.length === 0 ? (
          <div className="soft-empty-state">
            <strong>No {selectedTab.toLowerCase()} sessions</strong>
            <p>
              {selectedTab === 'Upcoming'
                ? 'Booked lessons and pending requests will appear here.'
                : 'Completed and cancelled lessons will appear here.'}
            </p>
          </div>
        ) : (
          <div className="sessions-table-wrap">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>{participantLabel}</th>
                  <th>Subject</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th aria-label="Open session detail" />
                </tr>
              </thead>
              <tbody>
                {visibleSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setActionError('');
                    }}
                  >
                    <td>
                      <strong>{session.participantName}</strong>
                      <span>{session.participantRole}</span>
                    </td>
                    <td>{session.subject}</td>
                    <td>{formatDateTime(session)}</td>
                    <td>
                      <span className={`session-status session-status-${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <span className="session-row-action">View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSession && (
        <div className="session-detail-backdrop" role="presentation">
          <section className="session-detail-modal" aria-labelledby="session-detail-title">
            <header>
              <p className="eyebrow">Session Detail</p>
              <h2 id="session-detail-title">{selectedSession.subject}</h2>
              <span className={`session-status session-status-${selectedSession.status.toLowerCase()}`}>
                {selectedSession.status}
              </span>
            </header>

            <div className="session-detail-grid">
              <article>
                <span>{participantLabel}</span>
                <strong>{selectedSession.participantName}</strong>
              </article>
              <article>
                <span>Date</span>
                <strong>{formatDateTime(selectedSession)}</strong>
              </article>
              <article>
                <span>Tutor</span>
                <strong>{selectedSession.tutorName}</strong>
              </article>
              <article>
                <span>Student</span>
                <strong>{selectedSession.studentName}</strong>
              </article>
            </div>

            <div className="session-note">
              <span>Lesson note</span>
              <p>{selectedSession.note || 'No note added for this session.'}</p>
            </div>

            {actionError && <p className="field-error">{actionError}</p>}

            <div className="session-detail-actions">
              {canPaySelectedSession && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/checkout/${selectedSession.id}`)}
                  disabled={cancelling}
                >
                  Pay Now
                </button>
              )}
              {canCancelSelectedSession && (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => {
                    setSessionToCancel(selectedSession);
                    setActionError('');
                  }}
                  disabled={cancelling}
                >
                  Cancel Booking
                </button>
              )}
              <button type="button" className="secondary-button" onClick={() => setSelectedSession(null)} disabled={cancelling}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {sessionToCancel && (
        <div className="session-detail-backdrop" role="presentation">
          <section className="session-confirm-modal" aria-labelledby="cancel-session-title">
            <header>
              <p className="eyebrow">Cancel Booking</p>
              <h2 id="cancel-session-title">Release this time slot?</h2>
              <p>
                Cancelling will mark this booking as cancelled and make the time slot available for other students.
              </p>
            </header>

            <div className="session-confirm-summary">
              <strong>{sessionToCancel.subject}</strong>
              <span>{formatDateTime(sessionToCancel)}</span>
              <span>{sessionToCancel.participantName}</span>
            </div>

            {actionError && <p className="field-error">{actionError}</p>}

            <div className="session-detail-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSessionToCancel(null);
                  setActionError('');
                }}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button type="button" className="danger-button" onClick={handleCancelBooking} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
