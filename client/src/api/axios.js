// Расположение: C:\OSPanel\domains\Arduino\client\src\api\axios.js
// Настройка Axios

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавление токена к каждому запросу
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ответов и ошибок
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если токен истёк или недействителен
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      // Не делаем редирект здесь, чтобы не было цикла
    }
    return Promise.reject(error);
  }
);

export default API;