import api from './api';

// Get all subjects
export const getAllSubjects = (params = {}) => {
  return api.get('/api/subjects', { params });
};

// Get subject by ID
export const getSubjectById = (subjectId) => {
  return api.get(`/api/subjects/${subjectId}`);
};

// Create a new subject (admin only)
export const createSubject = (subjectData) => {
  return api.post('/api/subjects', subjectData);
};

// Update a subject (admin only)
export const updateSubject = (subjectId, subjectData) => {
  return api.put(`/api/subjects/${subjectId}`, subjectData);
};

// Delete a subject (admin only)
export const deleteSubject = (subjectId) => {
  return api.delete(`/api/subjects/${subjectId}`);
};

// Get subjects by program
export const getSubjectsByProgram = (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/subjects`, { params });
};

// Get subjects assigned to a teacher
export const getSubjectsByTeacher = (teacherId, params = {}) => {
  return api.get(`/api/teachers/${teacherId}/subjects`, { params });
};

// Get subjects for current student
export const getStudentSubjects = (params = {}) => {
  return api.get('/api/subjects/student', { params });
};

// Get subjects for current teacher
export const getTeacherSubjects = (params = {}) => {
  return api.get('/api/subjects/teacher', { params });
};

// Assign a teacher to a subject
export const assignTeacherToSubject = (subjectId, teacherId) => {
  return api.put(`/api/subjects/${subjectId}/teacher`, { teacherId });
};

// Enroll a student in a subject
export const enrollStudentInSubject = (subjectId, studentId) => {
  return api.post(`/api/subjects/${subjectId}/students`, { studentId });
};

// Remove a student from a subject
export const removeStudentFromSubject = (subjectId, studentId) => {
  return api.delete(`/api/subjects/${subjectId}/students/${studentId}`);
};

// Get sessions for a subject
export const getSessionsBySubject = (subjectId, params = {}) => {
  return api.get(`/api/subjects/${subjectId}/sessions`, { params });
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByProgram,
  getSubjectsByTeacher,
  getStudentSubjects,
  getTeacherSubjects,
  assignTeacherToSubject,
  enrollStudentInSubject,
  removeStudentFromSubject,
  getSessionsBySubject
};