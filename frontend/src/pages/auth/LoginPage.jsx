import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import logoImage from '../../assets/images/logo.png';
import bgImage from '../../assets/images/background.jpg';

const dashboardPath = {
  Student: '/student/dashboard',
  Tutor: '/tutor/dashboard',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success('Login successful. Redirecting...');
      setTimeout(() => navigate(dashboardPath[user.role] || '/login'), 800);
    } catch (err) {
      let message = 'Invalid email or password';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || message;
      }
      setError('root', { message, type: 'server' });
      toast.error(message);
    }
  };

  return (
    <div className="auth-layout">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Left panel – branding */}
      <div className="auth-brand" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="auth-brand-overlay" />
        <div className="auth-brand-content">
          <Link to="/">
            <img src={logoImage} alt="Home Tutor" className="auth-brand-logo" />
          </Link>
          <h2 className="auth-brand-headline">Welcome back!</h2>
          <p className="auth-brand-sub">
            Log in to access your personalized dashboard and continue your learning journey.
          </p>
          <div className="auth-brand-bullets">
            {['Connect with top tutors', 'Track your progress', 'Schedule lessons easily'].map((t) => (
              <span key={t} className="auth-bullet">✓ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <p className="auth-eyebrow">Home Tutor Platform</p>
            <h1>Log In</h1>
            <p className="auth-form-sub">Access your tutor or student dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={errors.email || errors.root ? 'input-error' : ''}
                placeholder="john@example.com"
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="auth-forgot">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={errors.password || errors.root ? 'input-error' : ''}
                placeholder="Your password"
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="auth-error-box">
                <span>⚠</span> {errors.root.message}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" /> Logging in…
                </span>
              ) : 'Log In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
