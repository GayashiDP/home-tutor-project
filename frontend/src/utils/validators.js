export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (pw) => pw && pw.length >= 8;
export const validateRequired = (val) => val && val.toString().trim().length > 0;
