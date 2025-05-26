import api from './api';

// Student functions

// Mark attendance for a session
export const markAttendance = (sessionId, locationData) => {
  return api.post(`/api/attendance/mark/${sessionId}`, locationData);
};

// Get attendance history for the current student
export const getStudentAttendanceHistory = (params = {}) => {
  return api.get('/api/attendance/student/history', { params });
};

// Get attendance statistics for the current student
export const getStudentAttendanceStats = (params = {}) => {
  return api.get('/api/attendance/student/stats', { params });
};

// Teacher functions

// Get attendance for a specific session
export const getSessionAttendance = (sessionId, params = {}) => {
  return api.get(`/api/sessions/${sessionId}/attendance`, { params });
};

// Update attendance status for a student (teacher only)
export const updateAttendanceStatus = (attendanceId, updateData) => {
  return api.put(`/api/attendance/${attendanceId}`, updateData);
};

// Get attendance report for a teacher
export const getTeacherAttendanceReport = (params = {}) => {
  return api.get('/api/attendance/teacher/report', { params });
};

// Get attendance records for a specific session (teacher only)
export const getAttendanceBySession = (sessionId, params = {}) => {
  return api.get(`/api/attendance/session/${sessionId}`, { params });
};

// Verify all pending attendance records for a session (teacher only)
export const verifyAllAttendance = (sessionId) => {
  return api.put(`/api/attendance/session/${sessionId}/verify-all`);
};

// Get attendance summary for a teacher's subjects
export const getTeacherAttendanceSummary = (params = {}) => {
  return api.get('/api/attendance/teacher/summary', { params });
};

// Admin functions

// Get all attendance records
export const getAllAttendances = (params = {}) => {
  return api.get('/api/attendance', { params });
};

// Create a new attendance record
export const createAttendance = (attendanceData) => {
  return api.post('/api/attendance', attendanceData);
};

// Get attendance by ID
export const getAttendanceById = (attendanceId) => {
  return api.get(`/api/attendance/${attendanceId}`);
};

// Delete an attendance record
export const deleteAttendance = (attendanceId) => {
  return api.delete(`/api/attendance/${attendanceId}`);
};

// Get overall attendance report for admin
export const getOverallAttendanceReport = (params = {}) => {
  return api.get('/api/attendance/report/overall', { params });
};

// Send attendance reports to guardians
export const sendAttendanceReports = (reportData) => {
  return api.post('/api/attendance/report/send', reportData);
};

export default {
  markAttendance,
  getStudentAttendanceHistory,
  getStudentAttendanceStats,
  getSessionAttendance,
  updateAttendanceStatus,
  getTeacherAttendanceReport,
  getAllAttendances,
  createAttendance,
  getAttendanceById,
  deleteAttendance,
  getOverallAttendanceReport,
  sendAttendanceReports,
  getAttendanceBySession,
  verifyAllAttendance,
  getTeacherAttendanceSummary
};