import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import { useAuth } from './hooks/useAuth';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TutorCatalogPage from './pages/tutors/TutorCatalogPage';
import TutorDetailPage from './pages/tutors/TutorDetailPage';
import MySessionsPage from './pages/sessions/MySessionsPage';
import ProfilePage from './pages/profile/ProfilePage';
import TransactionHistoryPage from './pages/payments/TransactionHistoryPage';
import AvailabilityManagerPage from './pages/availability/AvailabilityManagerPage';
import SubjectManagerPage from './pages/subjects/SubjectManagerPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminPaymentApprovalPage from './pages/admin/AdminPaymentApprovalPage';
import AdminReviewManagementPage from './pages/admin/AdminReviewManagementPage';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function StudentBrowseRoute({ children }) {
  const { user } = useAuth();
  if (user && ['Tutor', 'Admin'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tutors" element={<StudentBrowseRoute><TutorCatalogPage /></StudentBrowseRoute>} />
        <Route path="/tutors/:id" element={<StudentBrowseRoute><TutorDetailPage /></StudentBrowseRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute roles={['Student','Tutor']}><MySessionsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute roles={['Student']}><TransactionHistoryPage /></ProtectedRoute>} />
        <Route path="/tutor/availability" element={<ProtectedRoute roles={['Tutor']}><AvailabilityManagerPage /></ProtectedRoute>} />
        <Route path="/tutor/subjects" element={<ProtectedRoute roles={['Tutor']}><SubjectManagerPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['Admin']}><AdminUserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['Admin']}><AdminPaymentApprovalPage /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['Admin']}><AdminReviewManagementPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
