import axios from 'axios';

/**
 * Pre-configured Axios instance for AgriCrop API.
 *
 * - Base URL is read from the VITE_API_URL environment variable,
 *   falling back to http://localhost:5000/api during development.
 * - Every outgoing request automatically attaches the JWT token
 *   stored in localStorage (if present).
 * - A 401 response from any endpoint clears local auth state and
 *   redirects the user to the login page.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ─────────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ────────────────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
