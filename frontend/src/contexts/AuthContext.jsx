import axios from 'axios';
import { useCallback, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { getProfile, saveProfile } from '../services/profileService';
import {
  clearSession,
  getStoredUser,
  saveSession,
  saveUser,
  TOKEN_KEY,
} from '../utils/storage';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(data);

      setUser(response.data.user);
    } catch (err) {
      let message = 'Registration failed. Please try again.';

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(data);
      const nextUser = response.data.user;
      const nextToken = response.data.token;

      saveSession({ token: nextToken, user: nextUser });
      setUser(nextUser);
      setProfile(null);
      setToken(nextToken);

      return nextUser;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Invalid email or password'
        : 'Invalid email or password';

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    const response = await getProfile();
    setProfile(response.data);
    setUser(response.data);
    saveUser(response.data);
    return response.data;
  }, []);

  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await saveProfile(data);
      const nextProfile = response.data.profile;

      setProfile(nextProfile);
      setUser(nextProfile);
      saveUser(nextProfile);

      return nextProfile;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to update profile'
        : 'Unable to update profile';

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setProfile(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        error,
        register,
        login,
        logout,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
