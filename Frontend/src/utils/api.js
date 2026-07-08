import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_BACKEND_URL
  || `${window.location.origin}/api`
  || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/admin/login')) {
        window.location.href = '/login/participant';
      }
    }
    return Promise.reject(error);
  }
);

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;

  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res;
};

export default api;
