import api from './api';
export const getPaymentHistory = () => api.get('/payments/history');
export const getReceipt = (id) => api.get(`/payments/receipt/${id}`, { responseType: 'blob' });
