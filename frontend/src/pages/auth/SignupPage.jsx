import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';
import { signupSchema } from '../../utils/validators';
import logoImage from '../../assets/images/logo.png';
import bgImage from '../../assets/images/background.jpg';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register: authRegister, loading } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      toast.success('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      let message = 'Registration failed. Please try again.';
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        if (Array.isArray(responseData?.errors)) {
          const firstError = responseData.errors[0];
          message = firstError.msg;
          responseData.errors.forEach((validationError) => {
            setError(validationError.path, { message: validationError.msg, type: 'server' });
          });
        } else if (responseData?.field === 'email') {
          message = responseData.error || 'Email already registered';
          setError('email', { message, type: 'server' });
        } else if (responseData?.error) {
          message = responseData.error;
        }
      }
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
          <h2 className="auth-brand-headline">Join Home Tutor</h2>
          <p className="auth-brand-sub">
            Create your free account and start connecting with the best tutors across Sri Lanka.
          </p>
          <div className="auth-brand-bullets">
            {['Free to register', 'Verified tutors only', 'Safe & secure platform'].map((t) => (
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
            <h1>Create Account</h1>
            <p className="auth-form-sub">Register as a student or tutor to start booking lessons</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            {/* Role selector – prominent, at top */}
            <fieldset className="auth-role-fieldset">
              <legend>I am a…</legend>
              <div className="auth-role-grid">
                {[
                  { value: 'Student', icon: '🎓', desc: 'I want to find a tutor' },
                  { value: 'Tutor', icon: '📚', desc: 'I want to teach students' },
                ].map(({ value, icon, desc }) => (
                  <label
                    key={value}
                    className={`auth-role-card ${selectedRole === value ? 'auth-role-selected' : ''}`}
                    htmlFor={`role-${value}`}
                  >
                    <input
                      id={`role-${value}`}
                      type="radio"
                      value={value}
                      {...register('role')}
                    />
                    <span className="role-card-icon">{icon}</span>
                    <span className="role-card-label">{value}</span>
                    <span className="role-card-desc">{desc}</span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="field-error">{errors.role.message}</p>}
            </fieldset>

            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                {...register('fullName')}
                className={errors.fullName ? 'input-error' : ''}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'input-error' : ''}
                placeholder="john@example.com"
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div className="auth-fields-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Min. 8 characters"
                />
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && (
                  <p className="field-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" /> Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="auth-terms">
            By signing up, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Log in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
