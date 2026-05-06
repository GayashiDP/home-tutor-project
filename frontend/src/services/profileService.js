import api from './api';

export const getProfile = () => api.get('/profile');

export const saveProfile = (data) =>
  api.patch('/profile', {
    name: data.name,
    bio: data.bio,
    subjects: data.subjects,
  });
