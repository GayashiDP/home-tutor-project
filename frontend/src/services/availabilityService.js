import api from './api';
export const getMyAvailability = () => api.get('/availability/my');
export const getTutorAvailability = (tutorId) => api.get(`/availability/tutor/${tutorId}`);
export const saveMyAvailability = (slots) => api.put('/availability', { slots });
export const deleteAvailabilitySlot = (id) => api.delete(`/availability/${id}`);
