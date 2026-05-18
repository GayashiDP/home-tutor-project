import api from './api';

export const getMyLiveSessions = () => api.get('/live-sessions/my');
export const getLiveSessionForBooking = (bookingId) => api.get(`/live-sessions/booking/${bookingId}`);
export const saveLiveSession = (data) => api.post('/live-sessions', data);
export const cancelLiveSession = (id) => api.patch(`/live-sessions/${id}/cancel`);
export const completeLiveSession = (id) => api.patch(`/live-sessions/${id}/complete`);
