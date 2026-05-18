import api from './api';
export const getMyAvailability = () => api.get('/availability/mine');
export const getTutorAvailability = (tutorId) => api.get(`/availability/tutors/${tutorId}`);
export const saveMyAvailability = (slots) => api.post('/availability/mine', { slots });
export const updateAvailabilitySlot = (id, slot) => api.patch(`/availability/mine/${id}`, slot);
