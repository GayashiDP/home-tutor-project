import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function TutorAvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutor/availability');
      setAvailability(response.data.availability || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      // Sample data
      setAvailability([
        { id: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '3', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tutor/availability', {
        dayOfWeek: selectedDay,
        startTime,
        endTime,
      });
      toast.success('Availability slot added');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add availability');
    }
  };

  const handleToggleSlot = async (slotId: string, isAvailable: boolean) => {
    try {
      await api.patch(`/tutor/availability/${slotId}`, { isAvailable: !isAvailable });
      toast.success('Availability updated');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update availability');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to remove this slot?')) return;
    try {
      await api.delete(`/tutor/availability/${slotId}`);
      toast.success('Slot removed');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove slot');
    }
  };

  const getGroupedAvailability = () => {
    const grouped: { [key: string]: AvailabilitySlot[] } = {};
    DAYS.forEach((day) => {
      grouped[day] = availability.filter((slot) => slot.dayOfWeek === day);
    });
    return grouped;
  };

  if (!user || user.role !== 'Tutor') {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-6xl mx-auto px-4 py-12">
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
          <h1 className="text-4xl font-bold mb-2">📅 Manage Availability</h1>
          <p className="text-blue-100">Set your weekly schedule to accept student bookings</p>
        </div>

        {/* Add Availability Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Availability Slot</h2>
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Weekly Schedule */}
        {!loading && (
          <div className="space-y-6">
            {DAYS.map((day) => {
              const daySlots = getGroupedAvailability()[day];
              return (
                <div key={day} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{day}</h3>
                  {daySlots.length === 0 ? (
                    <p className="text-gray-600">No availability set for this day</p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({Math.floor((new Date(`1970-01-01T${slot.endTime}`).getTime() - new Date(`1970-01-01T${slot.startTime}`).getTime()) / 3600000)} hours)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleSlot(slot.id, slot.isAvailable)}
                              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                                slot.isAvailable
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {slot.isAvailable ? '✓ Open' : 'Closed'}
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
