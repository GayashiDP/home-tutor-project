import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import './TutorDetail.css';

export default function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchTutorDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tutors/${id}`);
      setTutor(response.data.tutor);
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError(err.response?.data?.error || 'Failed to load tutor details');
      setSampleTutor();
    } finally {
      setLoading(false);
    }
  }, [id, setSampleTutor]);

  useEffect(() => {
    if (id) {
      queueMicrotask(fetchTutorDetail);
    }
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
            <button className="btn-primary">Book a Session</button>
            <button className="btn-secondary">Send Message</button>
          </div>
        </div>

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
        <section className="availability-section">
          <h2>Availability</h2>
          <div className="availability-grid">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="day-slot">
                <p className="day-name">{day.slice(0, 3)}</p>
                <p className="slots-text">Check slots</p>
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
    </div>
  );
}
