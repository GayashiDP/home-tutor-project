import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import SubjectManagerPage from './pages/subjects/SubjectManagerPage';
import TutorCatalogPage from './pages/tutors/TutorCatalogPage';
import TutorDetailPage from './pages/tutors/TutorDetailPage';

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
            path="/tutor/subjects"
            element={
              <ProtectedRoute>
                <SubjectManagerPage />
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
