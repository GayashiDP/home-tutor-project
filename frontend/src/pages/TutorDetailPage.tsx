import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

interface TutorDetail {
  id: string;
  name: string;
  email: string;
  bio: string;
  hourly_rate: number;
  subjects: Array<{ id: string; name: string; description: string }>;
  rating?: number;
  reviewCount?: number;
}

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTutorDetail();
    }
  }, [id]);

  const fetchTutorDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tutors/${id}`);
      setTutor(response.data.tutor);
    } catch (err: any) {
      console.error('Error fetching tutor:', err);
      setError(err.response?.data?.error || 'Failed to load tutor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading tutor details...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Tutor Not Found</h2>
            <p className="text-red-700 mb-6">{error || 'Unable to load tutor details'}</p>
            <button
              onClick={() => navigate('/tutors')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tutors')}
          className="mb-8 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition font-medium"
        >
          <span>←</span>
          <span>Back to Catalog</span>
        </button>

        {/* Tutor Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header Background */}
          <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center relative">
            <div className="text-8xl">👨‍🏫</div>
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
              ✓ Verified Tutor
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{tutor.name}</h1>
                {tutor.rating && (
                  <div className="flex items-center space-x-3">
                    <div className="flex text-yellow-400 text-lg">
                      {'⭐'.repeat(Math.round(tutor.rating))}
                    </div>
                    <span className="text-gray-600">
                      {tutor.rating.toFixed(1)} ({tutor.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-sm text-gray-600 font-medium">Hourly Rate</p>
                <p className="text-4xl font-bold text-blue-600">${tutor.hourly_rate}</p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-700 text-lg mb-8">{tutor.bio}</p>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105">
                Book a Session
              </button>
              <button className="flex-1 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        {tutor.subjects && tutor.subjects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subjects & Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutor.subjects.map((subject) => (
                <div key={subject.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 hover:shadow-lg transition">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <span className="text-2xl">📚</span>
                    <span>{subject.name}</span>
                  </h3>
                  <p className="text-gray-700">{subject.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition cursor-pointer">
                <p className="font-semibold text-gray-900">{day.slice(0, 3)}</p>
                <p className="text-xs text-gray-600 mt-2">Check slots</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
          <div className="space-y-4">
            {/* Example Reviews */}
            {[
              {
                name: 'Emily Chen',
                rating: 5,
                comment: 'Amazing tutor! Helped me improve my math scores significantly.',
                avatar: '👩‍🎓',
              },
              {
                name: 'Michael Johnson',
                rating: 5,
                comment: 'Very patient and explains concepts clearly. Highly recommended!',
                avatar: '👨‍🎓',
              },
              {
                name: 'Sarah Williams',
                rating: 4,
                comment: 'Great explanations. Would appreciate more homework practice.',
                avatar: '👩‍🎓',
              },
            ].map((review, idx) => (
              <div key={idx} className="border-l-4 border-blue-400 pl-6 py-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{review.avatar}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <div className="flex text-yellow-400">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
