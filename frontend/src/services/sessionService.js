import api from './api';

/**
 * Get all sessions with optional filters
 * @param {Object} filters - Optional filters for sessions
 * @returns {Promise<Array>} - The list of sessions
 */
export const getAllSessions = async (filters = {}) => {
  return api.get('/api/sessions', { params: filters });
};

/**
 * Get session by ID
 * @param {number} sessionId - The ID of the session
 * @returns {Promise<Object>} - The session data
 */
export const getSessionById = async (sessionId) => {
  return api.get(`/api/sessions/${sessionId}`);
};

/**
 * Create a new session (teacher or admin only)
 * @param {Object} sessionData - The session data
 * @returns {Promise<Object>} - The created session
 */
export const createSession = async (sessionData) => {
  return api.post('/api/sessions', sessionData);
};

/**
 * Update a session (teacher or admin only)
 * @param {number} sessionId - The ID of the session to update
 * @param {Object} sessionData - The updated session data
 * @returns {Promise<Object>} - The updated session
 */
export const updateSession = async (sessionId, sessionData) => {
  return api.put(`/api/sessions/${sessionId}`, sessionData);
};

/**
 * Close a session (teacher or admin only)
 * @param {number} sessionId - The ID of the session to close
 * @returns {Promise<Object>} - The response from the server
 */
export const closeSession = async (sessionId) => {
  return api.put(`/api/sessions/${sessionId}/close`);
};

/**
 * Delete a session (admin only)
 * @param {number} sessionId - The ID of the session to delete
 * @returns {Promise<Object>} - The response from the server
 */
export const deleteSession = async (sessionId) => {
  return api.delete(`/api/sessions/${sessionId}`);
};

/**
 * Get sessions for the current teacher
 * @param {Object} filters - Optional filters for sessions
 * @returns {Promise<Array>} - The list of sessions for the teacher
 */
export const getTeacherSessions = async (filters = {}) => {
  return api.get('/api/sessions/teacher', { params: filters });
};

/**
 * Get active sessions for the current student
 * @returns {Promise<Array>} - The list of active sessions for the student
 */
export const getActiveSessionsForStudent = async () => {
  return api.get('/api/sessions/active/student');
};

export default {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  closeSession,
  deleteSession,
  getTeacherSessions,
  getActiveSessionsForStudent
};