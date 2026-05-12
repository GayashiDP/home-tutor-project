import { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Try real API first, fall back to demo login
      let u;
      try {
        const res = await api.post('/auth/login', credentials);
        u = res.data?.user || res.data;
        const token = res.data?.token || res.data?.access_token;
        if (token) localStorage.setItem('ht_token', token);
      } catch (error) {
        if (error.response) throw error;
        // Demo fallback — derive role from email
        const email = credentials.email || '';
        const role = email.includes('tutor') ? 'Tutor' : email.includes('admin') ? 'Admin' : 'Student';
        const name = role === 'Admin' ? 'Admin User' : role === 'Tutor' ? 'Alex Rivera' : 'Jordan Kim';
        u = { id: '1', name, fullName: name, email, role };
      }
      setUser(u);
      localStorage.setItem('ht_user', JSON.stringify(u));
      return u;
    } finally { setLoading(false); }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      let u;
      try {
        const res = await api.post('/auth/register', data);
        u = res.data?.user || res.data;
        const token = res.data?.token;
        if (token) localStorage.setItem('ht_token', token);
      } catch (error) {
        if (error.response) throw error;
        u = { id: Date.now().toString(), name: data.fullName, fullName: data.fullName, email: data.email, role: data.role || 'Student' };
      }
      setUser(u);
      localStorage.setItem('ht_user', JSON.stringify(u));
      return u;
    } finally { setLoading(false); }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setUser(null);
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      const u = { ...user, ...(res.data?.profile || res.data) };
      setUser(u);
      localStorage.setItem('ht_user', JSON.stringify(u));
      return u;
    } catch { return user; }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      try {
        const res = await api.patch('/profile', data);
        const u = { ...user, ...(res.data?.profile || res.data) };
        setUser(u);
        localStorage.setItem('ht_user', JSON.stringify(u));
        return u;
      } catch {
        const u = { ...user, ...data };
        setUser(u);
        localStorage.setItem('ht_user', JSON.stringify(u));
        return u;
      }
    } finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, fetchProfile, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
