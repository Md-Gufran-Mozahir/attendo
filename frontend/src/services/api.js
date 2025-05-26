import axios from 'axios';

// Create an API instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token to requests
api.interceptors.request.use(
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

// Response interceptor for handling common response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle session expiration or unauthorized access
    if (response && response.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle forbidden access
    if (response && response.status === 403) {
      console.error('Access forbidden');
      // Optionally redirect to a forbidden page
      // window.location.href = '/forbidden';
    }
    
    // Network errors
    if (!response) {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api; 