// Normalizes API base URL at runtime for both axios and fetch
// to avoid hard-coded IP issues between localhost and server.

import axios from 'axios';

const ENV_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '';
// Fallback to same-origin /api when env not provided
// Prefer same-origin /api by default for production behind reverse proxies
const DEFAULT_BASE = `${window.location.origin}/api`;
const baseURL = ENV_BASE || DEFAULT_BASE;

// Build a helper to join URLs safely
function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

// Patterns of known hard-coded bases in the code
const hardCodedBases = [
  'http://10.5.12.1:4000/api',
  'http://10.5.12.1:4000',
  'http://localhost:4000/api',
  'http://localhost:4000'
];

function rewriteUrl(input) {
  try {
    // If absolute URL matches a hard-coded base, replace with baseURL
    for (const hc of hardCodedBases) {
      if (typeof input === 'string' && input.startsWith(hc)) {
        const path = input.slice(hc.length);
        return joinUrl(baseURL, path);
      }
    }

    // If it's a relative API path like /api/..., rebase to baseURL
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return joinUrl(baseURL.replace(/\/?api\/?$/, '/api'), input.replace(/^\/api\//, '/api/'));
    }

    return input;
  } catch {
    return input;
  }
}

// Patch global fetch
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const rewritten = rewriteUrl(input);
  return originalFetch(rewritten, init);
};

// Create a shared axios instance that other modules can import if desired
export const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Patch axios global default base if someone uses axios directly
axios.defaults.baseURL = baseURL;

// Also rewrite absolute URLs on the default axios for modules that call axios.get('http://10.5.12.1:4000/...')
axios.interceptors.request.use((config) => {
  if (typeof config.url === 'string') {
    config.url = rewriteUrl(config.url);
  }
  const token = localStorage.getItem('token');
  if (token && !config.headers?.Authorization) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

export function getApiBase() {
  return baseURL;
}
