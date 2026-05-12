import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

interface Subject {
  id: string;
  name: string;
  description: string;
  gradeLevel: string;
  isActive: boolean;
}

export default function TutorSubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    gradeLevel: 'All',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutor/subjects');
      setSubjects(response.data.subjects || []);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setError(err.response?.data?.error || 'Failed to load subjects');
      // Sample data
      setSubjects([
        {
          id: '1',
          name: 'Algebra',
          description: 'Master algebraic equations and problem-solving',
          gradeLevel: 'High School',
          isActive: true,
        },
        {
          id: '2',
          name: 'Geometry',
          description: 'Explore shapes, angles, and spatial reasoning',
          gradeLevel: 'High School',
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tutor/subjects', newSubject);
      toast.success('Subject added successfully');
      setNewSubject({ name: '', description: '', gradeLevel: 'All' });
      setIsAdding(false);
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add subject');
    }
  };

  const handleToggleSubject = async (subjectId: string, isActive: boolean) => {
    try {
      await api.patch(`/tutor/subjects/${subjectId}`, { isActive: !isActive });
      toast.success('Subject updated');
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update subject');
    }
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg p-8 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Teaching Subjects</h1>
            <p className="text-blue-100">Manage your expertise and availability</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            {isAdding ? 'Cancel' : '+ Add Subject'}
          </button>
        </div>

        {/* Add Subject Form */}
        {isAdding && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Subject</h2>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra, Spanish, Physics"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe what you teach and your approach..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Grade Level
                </label>
                <select
                  value={newSubject.gradeLevel}
                  onChange={(e) => setNewSubject({ ...newSubject, gradeLevel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Elementary</option>
                  <option>Middle School</option>
                  <option>High School</option>
                  <option>College</option>
                  <option>All Levels</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Add Subject
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Yet</h2>
            <p className="text-gray-600 mb-6">Add your first subject to start accepting students!</p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Add Your First Subject
            </button>
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className={`h-1 ${subject.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                    <button
                      onClick={() => handleToggleSubject(subject.id, subject.isActive)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        subject.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {subject.isActive ? '✓ Active' : 'Inactive'}
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">{subject.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      📚 {subject.gradeLevel}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 transition font-semibold text-sm">
                      Edit
                    </button>
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
