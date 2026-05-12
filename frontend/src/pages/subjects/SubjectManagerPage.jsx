import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';
import { createSubject, deleteSubject, getMySubjects } from '../../services/subjectService';

const emptyForm = {
  name: '',
  description: '',
  gradeLevel: '',
};

export default function SubjectManagerPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMySubjects();
      setSubjects(response.data.subjects || []);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load subjects'
        : 'Unable to load subjects';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'Tutor') {
      queueMicrotask(loadSubjects);
    }
  }, [loadSubjects, user?.role]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Tutor') {
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await createSubject(form);
      setSubjects((current) => [...current, response.data.subject].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(emptyForm);
      toast.success('Subject added successfully');
    } catch (err) {
      const responseData = axios.isAxiosError(err) ? err.response?.data : null;
      const message = responseData?.error || 'Unable to add subject';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await deleteSubject(subjectToDelete.id);
      setSubjects((current) => current.filter((item) => item.id !== subjectToDelete.id));
      setSubjectToDelete(null);
      toast.success('Subject removed successfully');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to remove subject'
        : 'Unable to remove subject';
      setError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="subject-manager-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <section className="subject-manager-shell" aria-labelledby="subjects-heading">
        <div className="profile-topbar">
          <Link to="/tutor/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <header className="subject-manager-header">
          <p className="eyebrow">Tutor Listing</p>
          <h1 id="subjects-heading">Manage Subjects</h1>
          <p>Add the subjects you teach and remove inactive listings from the catalog.</p>
        </header>

        <div className="subject-manager-grid">
          <form className="subject-form" onSubmit={handleSubmit}>
            <div>
              <p className="panel-kicker">New Subject</p>
              <h2>Add teaching area</h2>
            </div>

            <div className="form-field">
              <label htmlFor="name">Subject Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Mathematics"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Briefly describe what you cover in this subject."
              />
            </div>

            <div className="form-field">
              <label htmlFor="gradeLevel">Grade Level</label>
              <input
                id="gradeLevel"
                name="gradeLevel"
                type="text"
                value={form.gradeLevel}
                onChange={handleChange}
                placeholder="Grade 6-11, A/L, Undergraduate"
              />
            </div>

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Adding...' : 'Add Subject'}
            </button>
          </form>

          <section className="subject-list-panel" aria-labelledby="current-subjects-heading">
            <div className="subject-list-heading">
              <div>
                <p className="panel-kicker">Catalog Visibility</p>
                <h2 id="current-subjects-heading">Current Subjects</h2>
              </div>
              <span>{subjects.length} active</span>
            </div>

            {loading ? (
              <div className="soft-empty-state">
                <span className="mini-spinner" />
                <p>Loading subjects...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="soft-empty-state">
                <strong>No subjects added yet</strong>
                <p>Add your first subject to appear in student catalog filters.</p>
              </div>
            ) : (
              <div className="managed-subject-list">
                {subjects.map((subject) => (
                  <article className="managed-subject-card" key={subject.id}>
                    <div>
                      <h3>{subject.name}</h3>
                      <p>{subject.description || 'No description added.'}</p>
                      {subject.gradeLevel && <span>{subject.gradeLevel}</span>}
                    </div>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => setSubjectToDelete(subject)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {subjectToDelete && (
        <div className="session-detail-backdrop" role="presentation">
          <section className="session-confirm-modal" aria-labelledby="delete-subject-title">
            <header>
              <p className="eyebrow">Remove Subject</p>
              <h2 id="delete-subject-title">Remove {subjectToDelete.name}?</h2>
              <p>
                This subject will be removed from your active tutor listing and no longer appear in catalog filters.
              </p>
            </header>

            <div className="session-confirm-summary">
              <strong>{subjectToDelete.name}</strong>
              <span>{subjectToDelete.gradeLevel || 'No grade level set'}</span>
              <span>{subjectToDelete.description || 'No description added'}</span>
            </div>

            <div className="session-detail-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSubjectToDelete(null)}
                disabled={deleting}
              >
                Keep Subject
              </button>
              <button type="button" className="danger-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
