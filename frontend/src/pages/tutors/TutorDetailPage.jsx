import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { getTutorAvailability } from '../../services/availabilityService';
import api from '../../services/api';
import { createBooking } from '../../services/bookingService';
import './TutorDetail.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 12 }, (_, index) => index + 8);
const padHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

const nextDateFor = (dayName) => {
  const targetIndex = days.indexOf(dayName);
  const today = new Date();
  const currentIndex = (today.getDay() + 6) % 7;
  const daysUntilTarget = (targetIndex - currentIndex + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilTarget);
  return nextDate;
};

const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(date);

export default function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const setSampleTutor = useCallback(() => {
    setTutor({
      id: id,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      bio: 'Mathematics expert with 10+ years of experience in helping students excel in algebra, calculus, and statistics. I believe in making math fun and accessible.',
      hourly_rate: 45,
      rating: 4.9,
      reviewCount: 248,
      subjects: [
        {
          id: '1',
          name: 'Algebra',
          description: 'Master algebraic equations, functions, and problem-solving techniques.',
        },
        {
          id: '2',
          name: 'Calculus',
          description: 'Understand limits, derivatives, integrals, and their applications.',
        },
        {
          id: '3',
          name: 'Statistics',
          description: 'Learn data analysis, probability, and statistical inference.',
        },
      ],
    });
  }, [id]);

  const fetchTutorDetail = useCallback(async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);
      const [tutorResponse, availabilityResponse] = await Promise.all([
        api.get(`/tutors/${id}`),
        getTutorAvailability(id),
      ]);
      setTutor(tutorResponse.data.tutor);
      setAvailability(availabilityResponse.data.slots || []);
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError(err.response?.data?.error || 'Failed to load tutor details');
      setSampleTutor();
    } finally {
      setLoading(false);
    }
  }, [id, setSampleTutor]);

  const slotsByKey = new Map(availability.map((slot) => [`${slot.dayOfWeek}-${slot.startTime}`, slot]));
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  const availableSlotCount = availability.filter((slot) => slot.status === 'available').length;
  const bookedSlotCount = availability.filter((slot) => slot.status === 'booked').length;

  const openBookingForm = (slot) => {
    if (!slot || slot.status !== 'available') {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Student') {
      setBookingError('Only students can book tutor sessions.');
      return;
    }

    setSelectedSlot(slot);
    setBookingSubject(tutor.subjects?.[0]?.name || 'General Tutoring');
    setBookingNote('');
    setBookingConfirmed(false);
    setBookingConfirmation(null);
    setBookingError(null);
  };

  const closeBookingForm = () => {
    setSelectedSlot(null);
    setBookingSubject('');
    setBookingNote('');
    setBookingConfirmed(false);
    setBookingError(null);
  };

  const handleSubmitBooking = async (event) => {
    event.preventDefault();

    if (!selectedSlot || !bookingConfirmed) {
      return;
    }

    try {
      setBookingSlotId(selectedSlot.id);
      setBookingError(null);
      const response = await createBooking({
        tutorId: id,
        slotId: selectedSlot.id,
        subject: bookingSubject,
        note: bookingNote,
      });
      setBookingConfirmation({
        ...response.data.booking,
        tutorName: tutor.name,
        dayOfWeek: selectedSlot.dayOfWeek,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        timezone,
      });
      setSelectedSlot(null);
      await fetchTutorDetail();
      navigate(`/checkout/${response.data.booking.id}`);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Unable to book this slot. Please try another time.');
      await fetchTutorDetail();
    } finally {
      setBookingSlotId(null);
    }
  };

  useEffect(() => {
    if (id) {
      queueMicrotask(() => fetchTutorDetail({ showLoader: true }));
    }
  }, [fetchTutorDetail, id]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchTutorDetail();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchTutorDetail, id]);

  if (loading) {
    return (
      <div className="tutor-detail">
        <Navbar />
        <div className="detail-loading">
          <div className="spinner"></div>
          <p>Loading tutor details...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="tutor-detail">
        <Navbar />
        <div className="detail-error">
          <button
            onClick={() => navigate('/tutors')}
            className="back-btn"
          >
            ← Back to Catalog
          </button>
          <div className="error-content">
            <h2>Tutor Not Found</h2>
            <p>{error || 'Unable to load tutor details'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-detail">
      <Navbar />

      <div className="detail-container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tutors')}
          className="back-btn"
        >
          ← Back to Catalog
        </button>

        {/* Tutor Header */}
        <div className="detail-header">
          <div className="header-bg">
            <div className="avatar-large">👨‍🏫</div>
            <div className="verified-badge-large">✓ Verified Tutor</div>
          </div>

          <div className="header-info">
            <div className="info-left">
              <h1>{tutor.name}</h1>
              {tutor.rating && (
                <div className="rating-large">
                  <span className="stars-large">
                    {'⭐'.repeat(Math.round(tutor.rating))}
                  </span>
                  <span className="rating-text">
                    {tutor.rating.toFixed(1)} ({tutor.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="info-right">
              <p className="rate-label">Hourly Rate</p>
              <p className="rate-amount">${tutor.hourly_rate}</p>
            </div>
          </div>

          <p className="bio">{tutor.bio}</p>

          <div className="cta-buttons">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('availability-calendar')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Book a Session
            </button>
            <button className="btn-secondary">Send Message</button>
          </div>
        </div>

        <section className="detail-stats" aria-label="Tutor profile summary">
          <article>
            <span>Available Slots</span>
            <strong>{availableSlotCount}</strong>
          </article>
          <article>
            <span>Booked Slots</span>
            <strong>{bookedSlotCount}</strong>
          </article>
          <article>
            <span>Subjects</span>
            <strong>{tutor.subjects?.length || 0}</strong>
          </article>
        </section>

        {/* Subjects Section */}
        {tutor.subjects && tutor.subjects.length > 0 && (
          <section className="subjects-section">
            <h2>Subjects & Expertise</h2>
            <div className="subjects-grid">
              {tutor.subjects.map((subject) => (
                <div key={subject.id} className="subject-card">
                  <h3>📚 {subject.name}</h3>
                  <p>{subject.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Availability Section */}
        <section className="availability-section" id="availability-calendar">
          <h2>Availability</h2>
          <p className="availability-help">
            Times shown in {timezone}. Green slots are available; grey slots are unavailable or already booked.
          </p>
          {bookingConfirmation && (
            <section className="booking-confirmation-panel" aria-live="polite">
              <div>
                <p className="booking-confirmation-kicker">Booking Submitted</p>
                <h3>Session request is pending</h3>
                <p>
                  {bookingConfirmation.tutorName} · {bookingConfirmation.subject} · {bookingConfirmation.dayOfWeek},{' '}
                  {bookingConfirmation.startTime}-{bookingConfirmation.endTime} ({bookingConfirmation.timezone})
                </p>
              </div>
              <strong>{bookingConfirmation.status}</strong>
            </section>
          )}
          {bookingError && <p className="booking-error">{bookingError}</p>}
          <div className="student-calendar" aria-label="Tutor weekly availability">
            <div className="calendar-corner" />
            {days.map((day) => (
              <div className="calendar-day-heading" key={day}>
                {day.slice(0, 3)}
              </div>
            ))}

            {hours.map((hour) => (
              <div className="calendar-row" key={hour}>
                <div className="calendar-time">{padHour(hour)}</div>
                {days.map((day) => {
                  const slot = slotsByKey.get(`${day}-${padHour(hour)}`);
                  const isAvailable = slot?.status === 'available';
                  const isBooked = slot?.status === 'booked';
                  const isBusy = bookingSlotId === slot?.id;
                  return (
                    <button
                      className={`student-calendar-slot ${isAvailable ? 'student-calendar-available' : ''} ${isBooked ? 'student-calendar-booked' : ''}`}
                      disabled={!isAvailable || isBusy}
                      key={`${day}-${hour}`}
                      onClick={() => openBookingForm(slot)}
                      type="button"
                    >
                      {isBusy ? 'Booking...' : isAvailable ? 'Book' : isBooked ? 'Booked' : 'Unavailable'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2>Student Reviews</h2>
          <div className="reviews-list">
            {[
              {
                name: 'Emily Chen',
                rating: 5,
                comment: 'Amazing tutor! Helped me improve my math scores significantly. Her explanations are crystal clear.',
                avatar: '👩‍🎓',
              },
              {
                name: 'Michael Johnson',
                rating: 5,
                comment: 'Very patient and explains concepts thoroughly. I finally understand calculus!',
                avatar: '👨‍🎓',
              },
              {
                name: 'Sarah Williams',
                rating: 4,
                comment: 'Great teacher with excellent communication. Would appreciate more practice problems.',
                avatar: '👩‍🎓',
              },
            ].map((review, idx) => (
              <div key={idx} className="review-item">
                <div className="review-header">
                  <span className="review-avatar">{review.avatar}</span>
                  <div className="review-info">
                    <p className="review-name">{review.name}</p>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedSlot && (
        <div className="booking-modal-backdrop" role="presentation">
          <form className="booking-modal" onSubmit={handleSubmitBooking} aria-labelledby="booking-modal-title">
            <header>
              <p className="booking-confirmation-kicker">Confirm Lesson</p>
              <h2 id="booking-modal-title">Book a tutoring session</h2>
              <p>Review the lesson details before sending your pending booking request.</p>
            </header>

            <div className="booking-details-grid">
              <article>
                <span>Tutor</span>
                <strong>{tutor.name}</strong>
              </article>
              <article>
                <span>Date</span>
                <strong>{formatDate(nextDateFor(selectedSlot.dayOfWeek))}</strong>
              </article>
              <article>
                <span>Time</span>
                <strong>{selectedSlot.startTime}-{selectedSlot.endTime}</strong>
                <small>{timezone}</small>
              </article>
              <label className="booking-subject-field">
                <span>Subject</span>
                <select value={bookingSubject} onChange={(event) => setBookingSubject(event.target.value)} required>
                  {(tutor.subjects?.length ? tutor.subjects : [{ name: 'General Tutoring' }]).map((subject) => (
                    <option key={subject.id || subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="booking-note-field">
              <span>Lesson note</span>
              <textarea
                value={bookingNote}
                onChange={(event) => setBookingNote(event.target.value)}
                placeholder="Optional: share the topic or goal for this lesson."
                rows={4}
              />
            </label>

            <label className="booking-confirm-check">
              <input
                type="checkbox"
                checked={bookingConfirmed}
                onChange={(event) => setBookingConfirmed(event.target.checked)}
              />
              <span>I confirm these booking details and want to send this request.</span>
            </label>

            {bookingError && <p className="booking-error">{bookingError}</p>}

            <div className="booking-modal-actions">
              <button type="button" className="btn-secondary" onClick={closeBookingForm} disabled={Boolean(bookingSlotId)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!bookingConfirmed || Boolean(bookingSlotId)}>
                {bookingSlotId ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
