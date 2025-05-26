import api from './api';

/**
 * Get all teacher-program assignments
 * @returns {Promise<Array>} - The list of teacher-program assignments
 */
export const getAllTeacherProgramAssignments = async () => {
  return api.get('/api/teacher-programs');
};

/**
 * Get all teachers assigned to a specific program
 * @param {number} programId - The ID of the program
 * @returns {Promise<Array>} - The list of assigned teachers
 */
export const getTeachersByProgram = async (programId) => {
  return api.get(`/api/teacher-programs/program/${programId}`);
};

/**
 * Get all programs assigned to a specific teacher
 * @param {number} teacherId - The ID of the teacher
 * @returns {Promise<Array>} - The list of assigned programs
 */
export const getProgramsByTeacher = async (teacherId) => {
  return api.get(`/api/teacher-programs/teacher/${teacherId}`);
};

/**
 * Assign a teacher to a program
 * @param {number} programId - The ID of the program
 * @param {number} teacherId - The ID of the teacher to assign
 * @returns {Promise<Object>} - The response from the server
 */
export const assignTeacherToProgram = async (programId, teacherId) => {
  return api.post(`/api/teacher-programs/assign`, {
    programId,
    teacherId
  });
};

/**
 * Remove a teacher from a program
 * @param {number} programId - The ID of the program
 * @param {number} teacherId - The ID of the teacher to remove
 * @returns {Promise<Object>} - The response from the server
 */
export const removeTeacherFromProgram = async (programId, teacherId) => {
  return api.delete(`/api/teacher-programs/unassign`, {
    data: {
      programId,
      teacherId
    }
  });
};

export default {
  getAllTeacherProgramAssignments,
  getTeachersByProgram,
  getProgramsByTeacher,
  assignTeacherToProgram,
  removeTeacherFromProgram
}; 