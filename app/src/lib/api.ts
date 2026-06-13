import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend URL
});

api.interceptors.request.use((config) => {
  try {
    const storageStr = localStorage.getItem('irepairme-storage');
    if (storageStr) {
      const storage = JSON.parse(storageStr);
      const token = storage.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error('Error fetching token from storage', e);
  }
  return config;
});

export default api;
