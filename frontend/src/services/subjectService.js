import api from './api';

export const getMySubjects = () => api.get('/subjects/mine');

export const createSubject = (data) =>
  api.post('/subjects', {
    name: data.name,
    description: data.description,
    gradeLevel: data.gradeLevel,
  });

export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
