import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Register a new user
export const register = (userData) => {
  return api.post('/api/auth/register', userData);
};

// Login function to get token
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    if (response.data && response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Ensure user data exists before storing
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Return the response data with token and user
        return response.data;
      } else {
        console.error('Login response missing user data:', response.data);
        throw new Error('Authentication successful but user data is missing');
      }
    }
    
    // If we get here, something went wrong
    console.error('Login response missing token:', response.data);
    throw new Error('Authentication failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Verify token
export const verifyToken = () => {
  return api.get('/api/auth/verify');
};

// Forgot password
export const forgotPassword = (email) => {
  return api.post('/api/auth/forgot-password', { email });
};

// Reset password
export const resetPassword = (token, newPassword) => {
  return api.post(`/api/auth/reset-password/${token}`, { password: newPassword });
};

// Change password
export const changePassword = (oldPassword, newPassword) => {
  return api.post('/api/auth/change-password', { oldPassword, newPassword });
};

export default {
  register,
  login,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword,
  changePassword,
  isAuthenticated,
  getCurrentUser,
  getToken
};