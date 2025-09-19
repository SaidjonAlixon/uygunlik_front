import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.uygunlik.uz',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default api;
