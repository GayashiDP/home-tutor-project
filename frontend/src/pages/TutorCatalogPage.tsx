import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

interface Tutor {
  id: string;
  name: string;
  bio: string;
  hourly_rate: number;
  role: string;
  subjects?: Array<{ name: string }>;
  rating?: number;
  reviewCount?: number;
}

export default function TutorCatalogPage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutors');
      setTutors(response.data.tutors || []);
    } catch (err: any) {
      console.error('Error fetching tutors:', err);
      setError(err.response?.data?.error || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects?.some((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Page Header */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Browse Expert Tutors</h1>
          <p className="text-xl text-blue-100">
            Find the perfect tutor for your learning goals
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search by tutor name, subject, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Loading tutors...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium mb-4">{error}</p>
              <button
                onClick={fetchTutors}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTutors.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tutors Found</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'No tutors available at the moment. Please check back later.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Tutors Grid */}
          {!loading && !error && filteredTutors.length > 0 && (
            <div>
              <p className="text-gray-600 mb-8 font-medium">
                Found {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    onClick={() => navigate(`/tutors/${tutor.id}`)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 cursor-pointer group"
                  >
                    {/* Card Header - Avatar */}
                    <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden relative">
                      <div className="text-6xl group-hover:scale-110 transition duration-300">
                        👨‍🏫
                      </div>
                      {tutor.role === 'Tutor' && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Name and Rating */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {tutor.name}
                      </h3>

                      {/* Rating */}
                      {tutor.rating && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex text-yellow-400">
                            {'⭐'.repeat(Math.round(tutor.rating))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {tutor.rating.toFixed(1)} ({tutor.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tutor.bio || 'No bio available'}
                      </p>

                      {/* Subjects */}
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Subjects:</p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.subjects.slice(0, 3).map((subject, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                              >
                                {subject.name}
                              </span>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                +{tutor.subjects.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-4"></div>

                      {/* Hourly Rate and Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Hourly Rate</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${tutor.hourly_rate || 'N/A'}
                          </p>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition group-hover:scale-110 duration-300">
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
