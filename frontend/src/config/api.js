export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api');

export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
