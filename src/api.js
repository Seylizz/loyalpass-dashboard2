import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Ajoute automatiquement le token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;