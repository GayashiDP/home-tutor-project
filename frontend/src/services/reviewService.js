import api from './api';
export const getTutorReviews = (tutorId) => api.get(`/reviews/tutors/${tutorId}`);
export const createReview = (data) => api.post('/reviews', data);
export const getAllReviews = () => api.get('/reviews');
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
