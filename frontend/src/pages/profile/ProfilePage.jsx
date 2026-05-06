import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const dashboardPath = currentProfile.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard';

  const handleChange = (event) => {
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

  const removeSubject = (subject) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.filter((item) => item !== subject),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPageError('');

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
    }
  };

  return (
    <main className="profile-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <section className="profile-shell" aria-labelledby="profile-heading">
        <div className="profile-topbar">
          <Link to={dashboardPath}>Dashboard</Link>
          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>

        <header className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            {currentProfile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="eyebrow">{currentProfile.role} Profile</p>
            <h1 id="profile-heading">{currentProfile.name}</h1>
            <p>{currentProfile.email}</p>
          </div>
        </header>

        {!isEditing ? (
          <div className="profile-view">
            <section className="profile-section">
              <div>
                <p className="profile-label">Contact info</p>
                <p className="profile-value">{currentProfile.email}</p>
              </div>
              <div>
                <p className="profile-label">Bio</p>
                <p className="profile-value">
                  {currentProfile.bio || 'No bio added yet.'}
                </p>
              </div>
            </section>

            <section className="profile-section">
              <p className="profile-label">Subjects</p>
              {subjects.length > 0 ? (
                <div className="subject-list">
                  {subjects.map((subject) => (
                    <span className="subject-chip" key={subject}>{subject}</span>
                  ))}
                </div>
              ) : (
                <p className="profile-value">
                  {currentProfile.role === 'Tutor'
                    ? 'No teaching subjects added yet.'
                    : 'Subjects will appear here after bookings are added.'}
                </p>
              )}
            </section>

            {pageError && <p className="field-error">{pageError}</p>}

            <button type="button" className="primary-button" onClick={startEditing}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                minLength={2}
                maxLength={255}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                maxLength={1000}
                rows={5}
                value={form.bio}
                onChange={handleChange}
                placeholder="Share your teaching style, goals, or learning needs."
              />
            </div>

            {currentProfile.role === 'Tutor' && (
              <div className="form-field">
                <label htmlFor="subject">Subjects</label>
                <div className="subject-editor">
                  <input
                    id="subject"
                    type="text"
                    value={newSubject}
                    onChange={(event) => setNewSubject(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addSubject();
                      }
                    }}
                    placeholder="Add a subject"
                  />
                  <button type="button" className="secondary-button" onClick={addSubject}>
                    Add
                  </button>
                </div>

                <div className="subject-list">
                  {form.subjects.map((subject) => (
                    <button
                      type="button"
                      className="subject-chip removable"
                      key={subject}
                      onClick={() => removeSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pageError && <p className="field-error">{pageError}</p>}

            <div className="profile-actions">
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
