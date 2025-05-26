import api from './api';

// Get all teachers (admin only)
export const getAllTeachers = (params = {}) => {
  return api.get('/api/teachers', { params });
};

// Get teacher by ID
export const getTeacherById = (teacherId) => {
  return api.get(`/api/teachers/${teacherId}`);
};

// Create a new teacher (admin only)
export const createTeacher = (teacherData) => {
  return api.post('/api/teachers', teacherData);
};

// Update a teacher (admin only or self)
export const updateTeacher = (teacherId, teacherData) => {
  return api.put(`/api/teachers/${teacherId}`, teacherData);
};

// Delete a teacher (admin only)
export const deleteTeacher = (teacherId) => {
  return api.delete(`/api/teachers/${teacherId}`);
};

// Get teacher's sessions
export const getTeacherSessions = (teacherId, params = {}) => {
  return api.get(`/api/teachers/${teacherId}/sessions`, { params });
};

// Get attendance for a specific session
export const getSessionAttendance = (sessionId) => {
  return api.get(`/api/sessions/${sessionId}/attendance`);
};

// Update attendance status for a student in a session
export const updateAttendanceStatus = (attendanceId, status) => {
  return api.put(`/api/attendance/${attendanceId}`, { status });
};

// Get teacher's attendance report
export const getTeacherAttendanceReport = (teacherId, params = {}) => {
  return api.get(`/api/teachers/${teacherId}/attendance/report`, { params });
};

// Assign teacher to a program
export const assignTeacherToProgram = (teacherId, programId) => {
  return api.post(`/api/programs/${programId}/teachers`, { teacherId });
};

// Remove teacher from a program
export const removeTeacherFromProgram = (teacherId, programId) => {
  return api.delete(`/api/programs/${programId}/teachers/${teacherId}`);
};

// Get current teacher's profile
export const getCurrentTeacherProfile = () => {
  return api.get('/api/teachers/profile');
};

// Get subjects taught by a teacher
export const getTeacherSubjects = (teacherId, params = {}) => {
  return api.get(`/api/teachers/${teacherId}/subjects`, { params });
};

// Create a new session for a subject taught by the teacher
export const createSession = (sessionData) => {
  return api.post('/api/sessions', sessionData);
};

// Start a session
export const startSession = (sessionId, locationData) => {
  return api.post(`/api/sessions/${sessionId}/start`, locationData);
};

// End a session
export const endSession = (sessionId) => {
  return api.post(`/api/sessions/${sessionId}/end`);
};

// Get active sessions for the current teacher
export const getActiveSessionsForTeacher = () => {
  return api.get('/api/sessions/active/teacher');
};

// Mark student as absent
export const markStudentAbsent = (sessionId, studentId) => {
  return api.post(`/api/attendance/absent`, { sessionId, studentId });
};

// Generate and download attendance report
export const downloadAttendanceReport = (params) => {
  return api.get('/api/teachers/attendance/download', { 
    params,
    responseType: 'blob'
  });
};

export default {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSessions,
  getSessionAttendance,
  updateAttendanceStatus,
  getTeacherAttendanceReport,
  assignTeacherToProgram,
  removeTeacherFromProgram,
  getCurrentTeacherProfile,
  getTeacherSubjects,
  createSession,
  startSession,
  endSession,
  getActiveSessionsForTeacher,
  markStudentAbsent,
  downloadAttendanceReport
}; 