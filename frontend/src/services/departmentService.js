import api from './api';

// Get all departments
export const getAllDepartments = (params = {}) => {
  return api.get('/api/departments', { params });
};

// Get department by ID
export const getDepartmentById = (departmentId) => {
  return api.get(`/api/departments/${departmentId}`);
};

// Create a new department (admin only)
export const createDepartment = (departmentData) => {
  return api.post('/api/departments', departmentData);
};

// Update a department (admin only)
export const updateDepartment = (departmentId, departmentData) => {
  return api.put(`/api/departments/${departmentId}`, departmentData);
};

// Delete a department (admin only)
export const deleteDepartment = (departmentId) => {
  return api.delete(`/api/departments/${departmentId}`);
};

// Get programs in a department
export const getDepartmentPrograms = (departmentId, params = {}) => {
  return api.get(`/api/departments/${departmentId}/programs`, { params });
};

// Get faculty in a department
export const getDepartmentFaculty = (departmentId, params = {}) => {
  return api.get(`/api/departments/${departmentId}/faculty`, { params });
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentPrograms,
  getDepartmentFaculty
}; 