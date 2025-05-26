import api from './api';

// Get all programs
export const getAllPrograms = (params = {}) => {
  return api.get('/api/programs', { params });
};

// Get program by ID
export const getProgramById = (programId) => {
  return api.get(`/api/programs/${programId}`);
};

// Create a new program (admin only)
export const createProgram = (programData) => {
  return api.post('/api/programs', programData);
};

// Update a program (admin only)
export const updateProgram = (programId, programData) => {
  return api.put(`/api/programs/${programId}`, programData);
};

// Delete a program (admin only)
export const deleteProgram = (programId) => {
  return api.delete(`/api/programs/${programId}`);
};

// Get batches in a program
export const getProgramBatches = (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/batches`, { params });
};

// Get subjects in a program
export const getProgramSubjects = (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/subjects`, { params });
};

// Get students in a program
export const getProgramStudents = (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/students`, { params });
};

// Get teachers in a program
export const getProgramTeachers = (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/teachers`, { params });
};

// Assign a teacher to a program
export const assignTeacherToProgram = (programId, teacherId) => {
  return api.post(`/api/programs/${programId}/teachers`, { teacherId });
};

// Remove a teacher from a program
export const removeTeacherFromProgram = (programId, teacherId) => {
  return api.delete(`/api/programs/${programId}/teachers/${teacherId}`);
};

// Add a subject to a program
export const addSubjectToProgram = (programId, subjectData) => {
  return api.post(`/api/programs/${programId}/subjects`, subjectData);
};

// Remove a subject from a program
export const removeSubjectFromProgram = (programId, subjectId) => {
  return api.delete(`/api/programs/${programId}/subjects/${subjectId}`);
};

export default {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramBatches,
  getProgramSubjects,
  getProgramStudents,
  getProgramTeachers,
  assignTeacherToProgram,
  removeTeacherFromProgram,
  addSubjectToProgram,
  removeSubjectFromProgram
};