import api from './api';

export const processCheckout = ({ bookingId, cardNumber, expiry, cvv }) =>
  api.post('/payments/checkout', {
    bookingId,
    cardNumber,
    expiry,
    cvv,
  });

export const getPaymentHistory = () => api.get('/payments/history');
