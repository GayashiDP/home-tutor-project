import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import TutorCatalogPage from './pages/TutorCatalogPage';
import TutorDetailPage from './pages/TutorDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div className="min-h-screen">Login Page (Coming Soon)</div>} />
          <Route path="/tutors" element={<TutorCatalogPage />} />
          <Route path="/tutors/:id" element={<TutorDetailPage />} />
          <Route path="/dashboard" element={<div className="min-h-screen">Dashboard (Coming Soon)</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
