import api from './api';

export const createBooking = ({ tutorId, slotId, subject, note }) =>
  api.post('/bookings', {
    tutorId,
    slotId,
    subject,
    note,
  });

export const getMySessions = () => api.get('/bookings/mine');

export const getSessionDetail = (bookingId) => api.get(`/bookings/${bookingId}`);

export const cancelBooking = (bookingId) => api.patch(`/bookings/${bookingId}/cancel`);
