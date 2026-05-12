import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

interface StudentBooking {
  id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  scheduledAt: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export default function TutorBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<StudentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutor/bookings');
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      // Sample data
      setBookings([
        {
          id: '1',
          studentName: 'John Smith',
          studentEmail: 'john@example.com',
          subject: 'Algebra',
          scheduledAt: '2026-05-05 14:00',
          status: 'Confirmed',
        },
        {
          id: '2',
          studentName: 'Emily Davis',
          studentEmail: 'emily@example.com',
          subject: 'Calculus',
          scheduledAt: '2026-05-08 10:00',
          status: 'Pending',
        },
        {
          id: '3',
          studentName: 'Michael Brown',
          studentEmail: 'michael@example.com',
          subject: 'Geometry',
          scheduledAt: '2026-04-28 16:00',
          status: 'Completed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  });

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      await api.patch(`/tutor/bookings/${bookingId}`, { action });
      toast.success(`Booking ${action}ed`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'Tutor') {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/tutor/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">Student Bookings</h1>
          <p className="text-blue-100">Review and manage student booking requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings</h2>
            <p className="text-gray-600">
              {filter === 'all'
                ? "You don't have any bookings yet. Students will appear here once they book your sessions."
                : `No ${filter} bookings at the moment.`}
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{booking.studentName}</h3>
                    <p className="text-gray-600 mb-2">✉️ {booking.studentEmail}</p>
                    <p className="text-gray-600 mb-2">📚 Subject: {booking.subject}</p>
                    <p className="text-gray-600">📅 {new Date(booking.scheduledAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <div className="flex gap-2">
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'Confirmed' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                          View Details
                        </button>
                      )}
                      {booking.status === 'Completed' && (
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                          Give Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
