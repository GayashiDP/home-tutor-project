import api from './api';
export const createBooking = (data) => api.post('/bookings', data);
export const getMySessions = () => api.get('/bookings/my');
export const getSessionDetail = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const confirmBooking = (id) => api.patch(`/bookings/${id}/confirm`);
