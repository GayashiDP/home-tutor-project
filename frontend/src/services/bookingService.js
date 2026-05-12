import api from './api';

export const createBooking = ({ tutorId, slotId, subject, note }) =>
  api.post('/bookings', {
    tutorId,
    slotId,
    subject,
    note,
  });
