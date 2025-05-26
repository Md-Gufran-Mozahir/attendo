import api from './api';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    throw error;
  }
};

// Create a new user (admin only)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update a user (admin only for other users, users can update own profile)
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};

// Get user profile (for current user)
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile (for current user)
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password (for current user)
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get all teachers (admin only)
export const getAllTeachers = async () => {
  try {
    const response = await api.get('/api/users?type=teacher');
    return response;
  } catch (error) {
    console.error('Error getting all teachers:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllTeachers
};