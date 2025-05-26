import api from './api';

/**
 * Get all batches
 * @returns {Promise<Array>} - The list of batches
 */
export const getAllBatches = async () => {
  return api.get('/api/batches');
};

/**
 * Get a batch by ID
 * @param {number} batchId - The ID of the batch to retrieve
 * @returns {Promise<Object>} - The batch data
 */
export const getBatchById = async (batchId) => {
  return api.get(`/api/batches/${batchId}`);
};

/**
 * Create a new batch
 * @param {Object} batchData - The batch data to create
 * @returns {Promise<Object>} - The created batch
 */
export const createBatch = async (batchData) => {
  return api.post('/api/batches', batchData);
};

/**
 * Update a batch
 * @param {number} batchId - The ID of the batch to update
 * @param {Object} batchData - The updated batch data
 * @returns {Promise<Object>} - The updated batch
 */
export const updateBatch = async (batchId, batchData) => {
  return api.put(`/api/batches/${batchId}`, batchData);
};

/**
 * Delete a batch
 * @param {number} batchId - The ID of the batch to delete
 * @returns {Promise<Object>} - The response from the server
 */
export const deleteBatch = async (batchId) => {
  return api.delete(`/api/batches/${batchId}`);
};

/**
 * Get students in a batch
 * @param {number} batchId - The ID of the batch to get students from
 * @returns {Promise<Array>} - The list of students in the batch
 */
export const getBatchStudents = async (batchId) => {
  return api.get(`/api/batches/${batchId}/students`);
};

/**
 * Assign a student to a batch
 * @param {number} batchId - The ID of the batch to assign the student to
 * @param {Object} data - Object containing the studentId
 * @returns {Promise<Object>} - The response from the server
 */
export const assignStudentToBatch = async (batchId, data) => {
  return api.post(`/api/batches/${batchId}/students`, data);
};

/**
 * Remove a student from a batch
 * @param {number} batchId - The ID of the batch to remove the student from
 * @param {number} studentId - The ID of the student to remove
 * @returns {Promise<Object>} - The response from the server
 */
export const removeStudentFromBatch = async (batchId, studentId) => {
  return api.delete(`/api/batches/${batchId}/students/${studentId}`);
};

/**
 * Get batches for the current student
 * @returns {Promise<Array>} - The list of batches for the student
 */
export const getStudentBatches = async () => {
  return api.get('/api/batches/student');
};

/**
 * Get batches for the current teacher
 * @returns {Promise<Array>} - The list of batches for the teacher
 */
export const getTeacherBatches = async () => {
  return api.get('/api/batches/teacher');
};

/**
 * Get sessions for a batch
 * @param {number} batchId - The ID of the batch
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} - The list of sessions for the batch
 */
export const getBatchSessions = async (batchId, params = {}) => {
  return api.get(`/api/batches/${batchId}/sessions`, { params });
};

/**
 * Get attendance statistics for a batch
 * @param {number} batchId - The ID of the batch
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} - The attendance statistics
 */
export const getBatchAttendanceStats = async (batchId, params = {}) => {
  return api.get(`/api/batches/${batchId}/attendance/stats`, { params });
};

/**
 * Get batches by program
 * @param {number} programId - The ID of the program
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} - The list of batches for the program
 */
export const getBatchesByProgram = async (programId, params = {}) => {
  return api.get(`/api/programs/${programId}/batches`, { params });
};

export default {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  assignStudentToBatch,
  removeStudentFromBatch,
  getStudentBatches,
  getTeacherBatches,
  getBatchSessions,
  getBatchAttendanceStats,
  getBatchesByProgram
}; 