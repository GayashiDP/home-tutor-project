import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import TutorCatalogPage from './pages/TutorCatalogPage';
import TutorDetailPage from './pages/TutorDetailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import StudentBookingsPage from './pages/student/BookingsPage';
import TutorAvailabilityPage from './pages/tutor/AvailabilityPage';
import TutorBookingsPage from './pages/tutor/BookingsPage';
import TutorSubjectsPage from './pages/tutor/SubjectsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div className="min-h-screen">Login Page (Coming Soon)</div>} />

          {/* Tutor Browse Routes */}
          <Route path="/tutors" element={<TutorCatalogPage />} />
          <Route path="/tutors/:id" element={<TutorDetailPage />} />

          {/* Dashboard Routes */}
          <Route path="/student/dashboard" element={<DashboardPage role="Student" />} />
          <Route path="/tutor/dashboard" element={<DashboardPage role="Tutor" />} />
          <Route path="/dashboard" element={<DashboardPage role="Student" />} />

          {/* Profile Routes */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Student Routes */}
          <Route path="/student/bookings" element={<StudentBookingsPage />} />

          {/* Tutor Routes */}
          <Route path="/tutor/subjects" element={<TutorSubjectsPage />} />
          <Route path="/tutor/availability" element={<TutorAvailabilityPage />} />
          <Route path="/tutor/bookings" element={<TutorBookingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center">Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
