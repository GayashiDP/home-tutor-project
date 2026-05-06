import api from './api';

export const registerUser = (data) =>
  api.post('/auth/register', {
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    role: data.role,
  });

export const loginUser = (data) =>
  api.post('/auth/login', {
    email: data.email,
    password: data.password,
  });
