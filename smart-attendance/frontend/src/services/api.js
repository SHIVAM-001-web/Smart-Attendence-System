import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Har request ke saath token bhejne ke liye interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;