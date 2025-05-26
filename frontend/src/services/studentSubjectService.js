import api from './api';

/**
 * Get all students enrolled in a specific subject
 * @param {number} subjectId - The ID of the subject
 * @returns {Promise<Array>} - The list of enrolled students
 */
export const getStudentsBySubject = async (subjectId) => {
  return api.get(`/api/student-subjects/subject/${subjectId}`);
};

/**
 * Get all subjects for a specific student
 * @param {number} studentId - The ID of the student
 * @returns {Promise<Array>} - The list of subjects for the student
 */
export const getSubjectsByStudent = async (studentId) => {
  return api.get(`/api/student-subjects/student/${studentId}`);
};

/**
 * Enroll a student in a subject
 * @param {number} subjectId - The ID of the subject
 * @param {number} studentId - The ID of the student to enroll
 * @returns {Promise<Object>} - The response from the server
 */
export const enrollStudentInSubject = async (subjectId, studentId) => {
  return api.post(`/api/student-subjects/enroll`, {
    subjectId,
    studentId
  });
};

/**
 * Remove a student from a subject
 * @param {number} subjectId - The ID of the subject
 * @param {number} studentId - The ID of the student to remove
 * @returns {Promise<Object>} - The response from the server
 */
export const removeStudentFromSubject = async (subjectId, studentId) => {
  return api.delete(`/api/student-subjects/unenroll`, {
    data: {
      subjectId,
      studentId
    }
  });
};

export default {
  getStudentsBySubject,
  getSubjectsByStudent,
  enrollStudentInSubject,
  removeStudentFromSubject
}; 