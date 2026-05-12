import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { getSessionDetail } from '../../services/bookingService';
import { processCheckout } from '../../services/paymentService';

const emptyCard = {
  cardNumber: '',
  expiry: '',
  cvv: '',
};

const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatDateTime = (session) => {
  if (!session?.sessionDate) {
    return 'Session time unavailable';
  }

  const date = new Date(`${session.sessionDate}T00:00:00`);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const time = session.startTime && session.endTime
    ? `${session.startTime}-${session.endTime}`
    : 'Time unavailable';

  return `${formattedDate} · ${time}`;
};

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [card, setCard] = useState(emptyCard);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSessionDetail(bookingId);
      setSession(response.data.session);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load checkout'
        : 'Unable to load checkout';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (user && bookingId) {
      queueMicrotask(loadSession);
    }
  }, [bookingId, loadSession, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Student') {
    return <Navigate to="/sessions" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCard((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setPaying(true);
      setError('');
      const response = await processCheckout({
        bookingId,
        ...card,
      });
      setReceipt(response.data.receipt || response.data.payment);
      setSession(response.data.session);
      setCard(emptyCard);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Payment failed. Please try again.'
        : 'Payment failed. Please try again.';
      setError(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="checkout-page">
      <Navbar />

      <section className="checkout-shell" aria-labelledby="checkout-heading">
        <div className="profile-topbar">
          <Link to="/sessions">My Sessions</Link>
          <Link to="/tutors">Browse Tutors</Link>
        </div>

        <header className="subject-manager-header">
          <p className="eyebrow">Secure Checkout</p>
          <h1 id="checkout-heading">Payment Checkout</h1>
          <p>Review your session details and complete a mock card payment to confirm the booking.</p>
        </header>

        {loading ? (
          <div className="soft-empty-state">
            <span className="mini-spinner" />
            <p>Loading checkout...</p>
          </div>
        ) : error && !session ? (
          <div className="sessions-error">
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={loadSession}>
              Retry
            </button>
          </div>
        ) : receipt ? (
          <section className="receipt-panel" aria-live="polite">
            <div className="receipt-mark">✓</div>
            <p className="eyebrow">Payment Successful</p>
            <h2>Booking confirmed</h2>
            <p>Your digital receipt has been generated automatically.</p>
            <div className="receipt-grid">
              <article>
                <span>Receipt No</span>
                <strong>{receipt.receiptNo}</strong>
              </article>
              <article>
                <span>Student</span>
                <strong>{session.studentName}</strong>
              </article>
              <article>
                <span>Tutor</span>
                <strong>{session.tutorName}</strong>
              </article>
              <article>
                <span>Subject</span>
                <strong>{session.subject}</strong>
              </article>
              <article>
                <span>Status</span>
                <strong>{session.status}</strong>
              </article>
              <article>
                <span>Total Paid</span>
                <strong>{formatCurrency(receipt.amount)}</strong>
              </article>
              <article>
                <span>Session</span>
                <strong>{formatDateTime(session)}</strong>
              </article>
            </div>
            <Link className="primary-button checkout-link-button" to="/sessions">
              View My Sessions
            </Link>
            <Link className="secondary-link-button checkout-link-button" to="/transactions">
              View Receipt History
            </Link>
          </section>
        ) : (
          <div className="checkout-grid">
            <section className="checkout-summary-card" aria-label="Session summary">
              <p className="panel-kicker">Session Summary</p>
              <h2>{session.subject}</h2>
              <div className="checkout-summary-list">
                <div>
                  <span>Tutor</span>
                  <strong>{session.tutorName}</strong>
                </div>
                <div>
                  <span>Student</span>
                  <strong>{session.studentName}</strong>
                </div>
                <div>
                  <span>Date & Time</span>
                  <strong>{formatDateTime(session)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{session.status}</strong>
                </div>
              </div>
              <div className="checkout-total">
                <span>Total</span>
                <strong>{formatCurrency(session.amountDue)}</strong>
              </div>
            </section>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div>
                <p className="panel-kicker">Mock Payment</p>
                <h2>Card Details</h2>
              </div>

              <label className="form-field">
                Card Number
                <input
                  name="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={card.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </label>

              <div className="checkout-card-row">
                <label className="form-field">
                  Expiry
                  <input
                    name="expiry"
                    value={card.expiry}
                    onChange={handleChange}
                    placeholder="12/30"
                    required
                  />
                </label>
                <label className="form-field">
                  CVV
                  <input
                    name="cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    required
                  />
                </label>
              </div>

              {error && (
                <div className="payment-error">
                  <strong>Payment failed</strong>
                  <p>{error}</p>
                  <span>Use a card number that does not start with 4000 to simulate success.</span>
                </div>
              )}

              <button type="submit" className="primary-button" disabled={paying || session.status !== 'Pending'}>
                {paying ? 'Processing...' : `Pay ${formatCurrency(session.amountDue)}`}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
