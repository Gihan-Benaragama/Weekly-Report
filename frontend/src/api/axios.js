import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API = axios.create({
    baseURL: isLocalhost 
        ? 'http://localhost:5000/api' 
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;