import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = {
  name: '',
  bio: '',
  subjects: [],
};

export default function ProfilePage() {
  const { user, profile, loading, fetchProfile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newSubject, setNewSubject] = useState('');
  const [pageError, setPageError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!user || profile) {
      return;
    }

    fetchProfile().catch((err) => {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load profile'
        : 'Unable to load profile';
      setPageError(message);
      toast.error(message);
    });
  }, [fetchProfile, profile, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentProfile = profile || user;
  const subjects = currentProfile.subjects || [];
  const isTutor = currentProfile.role === 'Tutor';
  const dashboardPath = isTutor ? '/tutor/dashboard' : '/student/dashboard';

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const startEditing = () => {
    setForm({
      name: currentProfile.name || '',
      bio: currentProfile.bio || '',
      subjects: currentProfile.subjects || [],
    });
    setNewSubject('');
    setIsEditing(true);
  };

  const addSubject = () => {
    const subject = newSubject.trim();
    if (!subject || form.subjects.includes(subject)) {
      setNewSubject('');
      return;
    }

    setForm((current) => ({ ...current, subjects: [...current.subjects, subject] }));
    setNewSubject('');
  };

  const removeSubject = (subject: string) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.filter((item) => item !== subject),
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setPageError('');
    setSubmitLoading(true);

    try {
      await updateProfile(form);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to update profile'
        : 'Unable to update profile';
      setPageError(message);
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to={dashboardPath}
          className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
              {currentProfile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-1">
                {currentProfile.role} Profile
              </p>
              <h1 className="text-3xl font-bold text-gray-900">{currentProfile.name}</h1>
              <p className="text-gray-600 text-sm mt-2">{currentProfile.email}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={startEditing}
                disabled={isEditing}
                className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {isEditing ? 'Editing...' : 'Edit Profile'}
              </button>
              <button
                onClick={logout}
                className="flex-1 md:flex-none px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs font-semibold uppercase">Role</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{currentProfile.role}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs font-semibold uppercase">Status</p>
              <p className="text-xl font-bold text-green-700 mt-1">✓ Active</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs font-semibold uppercase">Subjects</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{subjects.length}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs font-semibold uppercase">Profile</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">{currentProfile.bio ? 'Complete' : 'Incomplete'}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {pageError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {pageError}
          </div>
        )}

        {/* View Mode */}
        {!isEditing && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                About You
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentProfile.bio || 'No bio added yet. Add one to help others learn about you!'}
              </p>
            </div>

            {/* Subjects Section (for Tutors) */}
            {isTutor && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Teaching Subjects
                </h2>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {subjects.map((subject) => (
                      <span key={subject} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No subjects added yet. Add subjects to your profile to attract students!</p>
                )}
              </div>
            )}

            {/* Contact Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📧</span>
                Contact Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-gray-900 font-medium mt-1">{currentProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                minLength={2}
                maxLength={255}
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Bio Field */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                About You
              </label>
              <textarea
                name="bio"
                maxLength={1000}
                rows={5}
                value={form.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={isTutor ? 'Share your teaching style and experience...' : 'Tell us about your learning goals...'}
              />
              <p className="text-gray-600 text-sm mt-2">{form.bio.length}/1000 characters</p>
            </div>

            {/* Subjects Field (for Tutors) */}
            {isTutor && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Teaching Subjects
                </label>

                {/* Add Subject Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a subject (e.g., Mathematics)"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* Subject Tags */}
                <div className="flex flex-wrap gap-3">
                  {form.subjects.map((subject) => (
                    <div
                      key={subject}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 font-medium"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="text-blue-600 hover:text-blue-900 transition font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-md p-8 flex gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
