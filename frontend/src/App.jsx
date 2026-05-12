import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import AvailabilityManagerPage from './pages/availability/AvailabilityManagerPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import MySessionsPage from './pages/sessions/MySessionsPage';
import SubjectManagerPage from './pages/subjects/SubjectManagerPage';
import TransactionHistoryPage from './pages/payments/TransactionHistoryPage';
import TutorCatalogPage from './pages/tutors/TutorCatalogPage';
import TutorDetailPage from './pages/tutors/TutorDetailPage';

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/tutors"  element={<TutorCatalogPage />} />
          <Route path="/tutors/:id"  element={<TutorDetailPage />} />
          <Route path="/signup"  element={<SignupPage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <MySessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/subjects"
            element={
              <ProtectedRoute>
                <SubjectManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/availability"
            element={
              <ProtectedRoute>
                <AvailabilityManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage role="Student" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage role="Tutor" />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
