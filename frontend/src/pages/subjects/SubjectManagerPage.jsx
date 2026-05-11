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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(`Remove "${subject.name}" from your tutor listing?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteSubject(subject.id);
      setSubjects((current) => current.filter((item) => item.id !== subject.id));
      toast.success('Subject removed successfully');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to remove subject'
        : 'Unable to remove subject';
      setError(message);
      toast.error(message);
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

        <form className="subject-form" onSubmit={handleSubmit}>
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
            <h2 id="current-subjects-heading">Current Subjects</h2>
            <span>{subjects.length} active</span>
          </div>

          {loading ? (
            <p className="profile-value">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="profile-value">No subjects added yet.</p>
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
                    onClick={() => handleDelete(subject)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
