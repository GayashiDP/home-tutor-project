import api from './api';
export const getMySubjects = () => api.get('/subjects/my');
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
