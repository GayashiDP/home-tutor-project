import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import HomePage from './pages/HomePage';   // ← NEW

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"        element={<HomePage />} />          {/* ← NEW home page */}
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
          <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
