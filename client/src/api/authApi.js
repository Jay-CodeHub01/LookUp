// src/api/authApi.js
import API from './axios';

export const registerUser = (data) => {
    console.log('Registering user with data:', data); // Debug log
    return API.post('/auth/register', data);
}
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');