import api from './api';

export const getMyAvailability = () => api.get('/availability/mine');

export const saveMyAvailability = (slots) => api.post('/availability/mine', { slots });

export const getTutorAvailability = (tutorId) => api.get(`/availability/tutors/${tutorId}`);

export const updateMyAvailabilitySlot = (slotId, slot) => api.patch(`/availability/mine/${slotId}`, slot);
