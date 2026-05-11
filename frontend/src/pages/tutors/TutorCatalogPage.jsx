import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import './TutorCatalog.css';

export default function TutorCatalogPage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const setSampleTutors = useCallback(() => {
    const sampleTutors = [
      {
        id: '1',
        name: 'Sarah Johnson',
        bio: 'Mathematics expert with 10+ years of experience. Specialized in algebra and calculus.',
        hourly_rate: 45,
        rating: 4.9,
        reviewCount: 248,
        subjects: [
          { name: 'Math' },
          { name: 'Algebra' },
          { name: 'Calculus' },
        ],
      },
      {
        id: '2',
        name: 'Mike Chen',
        bio: 'English teacher and TOEFL specialist. Help students improve their writing and speaking skills.',
        hourly_rate: 40,
        rating: 4.8,
        reviewCount: 156,
        subjects: [
          { name: 'English' },
          { name: 'TOEFL' },
          { name: 'Writing' },
        ],
      },
      {
        id: '3',
        name: 'Emma Wilson',
        bio: 'Science tutor passionate about making complex concepts easy to understand.',
        hourly_rate: 50,
        rating: 4.95,
        reviewCount: 312,
        subjects: [
          { name: 'Physics' },
          { name: 'Chemistry' },
          { name: 'Biology' },
        ],
      },
      {
        id: '4',
        name: 'David Kumar',
        bio: 'Computer Science mentor helping students master programming and algorithms.',
        hourly_rate: 55,
        rating: 4.7,
        reviewCount: 189,
        subjects: [
          { name: 'Python' },
          { name: 'Java' },
          { name: 'Data Structures' },
        ],
      },
    ];

    setTutors(sampleTutors.filter((tutor) => {
      const matchesName = !searchTerm
        || tutor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject
        || tutor.subjects?.some((subject) => subject.name === selectedSubject);
      return matchesName && matchesSubject;
    }));
    setSubjectOptions(
      Array.from(new Set(sampleTutors.flatMap((tutor) => tutor.subjects.map((subject) => subject.name))))
        .sort((a, b) => a.localeCompare(b))
    );
  }, [searchTerm, selectedSubject]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
  };

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutors', {
        params: {
          name: searchTerm.trim() || undefined,
          subject: selectedSubject || undefined,
        },
      });
      setTutors(response.data.tutors || []);
      setSubjectOptions(response.data.subjects || []);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err.response?.data?.error || 'Failed to load tutors');
      setSampleTutors();
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSubject, setSampleTutors]);

  useEffect(() => {
    queueMicrotask(fetchTutors);
  }, [fetchTutors]);

  const hasFilters = Boolean(searchTerm || selectedSubject);

  return (
    <div className="tutor-catalog">
      <Navbar />

      {/* Page Header */}
      <section className="catalog-header">
        <div className="header-content">
          <h1>Browse Expert Tutors</h1>
          <p>Find the perfect tutor for your learning goals</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="filter-field search-field">
            <label htmlFor="tutor-search">Search by name</label>
            <input
              id="tutor-search"
              type="search"
              placeholder="Type a tutor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-field subject-field">
            <label htmlFor="subject-filter">Subject</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="subject-select"
            >
              <option value="">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="clear-btn"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="catalog-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tutors...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchTutors} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tutors.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No Tutors Found</h2>
            <p>
              {hasFilters
                ? 'Try adjusting your search criteria'
                : 'No tutors available at the moment. Please check back later.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="clear-search-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Tutors Grid */}
        {!loading && !error && tutors.length > 0 && (
          <div>
            <p className="results-count">
              {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} found
            </p>
            <div className="tutors-grid">
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="tutor-card"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="avatar">👨‍🏫</div>
                    {tutor.role === 'Tutor' && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h3 className="tutor-name">{tutor.name}</h3>

                    {/* Rating */}
                    {tutor.rating && (
                      <div className="rating">
                        <span className="stars">
                          {'⭐'.repeat(Math.round(tutor.rating))}
                        </span>
                        <span className="rating-text">
                          {tutor.rating.toFixed(1)} ({tutor.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="tutor-bio">{tutor.bio || 'No bio available'}</p>

                    {/* Subjects */}
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div className="subjects">
                        <p className="subjects-label">Subjects:</p>
                        <div className="subject-tags">
                          {tutor.subjects.slice(0, 3).map((subject, idx) => (
                            <span key={idx} className="subject-tag">
                              {subject.name}
                            </span>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <span className="subject-tag more">
                              +{tutor.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="card-footer">
                      <div className="rate">
                        <p className="rate-label">Hourly Rate</p>
                        <p className="rate-amount">${tutor.hourly_rate || 'N/A'}</p>
                      </div>
                      <button className="view-btn">View →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
