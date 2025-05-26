import api from './api';

// Get all students (admin only)
export const getAllStudents = (params = {}) => {
  return api.get('/api/students', { params });
};

// Get student by ID
export const getStudentById = (studentId) => {
  return api.get(`/api/students/${studentId}`);
};

// Get student details (includes program, batch, etc.)
export const getStudentDetails = (studentId) => {
  return api.get(`/api/students/${studentId}/details`);
};

// Create a new student (admin only)
export const createStudent = (studentData) => {
  return api.post('/api/students', studentData);
};

// Update a student (admin only)
export const updateStudent = (studentId, studentData) => {
  return api.put(`/api/students/${studentId}`, studentData);
};

// Delete a student (admin only)
export const deleteStudent = (studentId) => {
  return api.delete(`/api/students/${studentId}`);
};

// Get student attendance history
export const getStudentAttendance = (studentId, params = {}) => {
  return api.get(`/api/students/${studentId}/attendance`, { params });
};

// Get student attendance statistics
export const getStudentAttendanceStats = (studentId, params = {}) => {
  return api.get(`/api/students/${studentId}/attendance/stats`, { params });
};

// Assign student to a batch
export const assignStudentToBatch = (studentId, batchId) => {
  return api.post(`/api/batches/${batchId}/students`, { studentId });
};

// Remove student from a batch
export const removeStudentFromBatch = (studentId, batchId) => {
  return api.delete(`/api/batches/${batchId}/students/${studentId}`);
};

// Get current student's profile
export const getCurrentStudentProfile = () => {
  return api.get('/api/students/profile');
};

// Get current student's subjects
export const getCurrentStudentSubjects = (params = {}) => {
  return api.get('/api/students/subjects', { params });
};

// Get active sessions for the current student
export const getActiveSessionsForStudent = () => {
  return api.get('/api/sessions/active/student');
};

// Mark attendance for a session
export const markAttendance = (sessionId, locationData) => {
  return api.post(`/api/attendance/mark/${sessionId}`, locationData);
};

// Get attendance history for the current student
export const getCurrentStudentAttendanceHistory = (params = {}) => {
  return api.get('/api/attendance/student/history', { params });
};

// Get attendance statistics for the current student
export const getCurrentStudentAttendanceStats = (params = {}) => {
  return api.get('/api/attendance/student/stats', { params });
};

// Get student's guardian information
export const getStudentGuardian = (studentId) => {
  return api.get(`/api/students/${studentId}/guardian`);
};

// Update student's guardian information
export const updateStudentGuardian = (studentId, guardianData) => {
  return api.put(`/api/students/${studentId}/guardian`, guardianData);
};

// Download student's attendance report
export const downloadAttendanceReport = (studentId, params = {}) => {
  return api.get(`/api/students/${studentId}/attendance/download`, {
    params,
    responseType: 'blob'
  });
};

export default {
  getAllStudents,
  getStudentById,
  getStudentDetails,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentAttendanceStats,
  assignStudentToBatch,
  removeStudentFromBatch,
  getCurrentStudentProfile,
  getCurrentStudentSubjects,
  getActiveSessionsForStudent,
  markAttendance,
  getCurrentStudentAttendanceHistory,
  getCurrentStudentAttendanceStats,
  getStudentGuardian,
  updateStudentGuardian,
  downloadAttendanceReport
};