const express = require('express');
const router = express.Router();
const { 
  getStudentsBySubject, 
  getSubjectsByStudent, 
  enrollStudent, 
  unenrollStudent 
} = require('../controllers/studentSubjectController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes for student-subject operations
router.get('/subject/:subjectId', protect, getStudentsBySubject);
router.get('/student/:studentId', protect, getSubjectsByStudent);
router.post('/enroll', protect, admin, enrollStudent);
router.delete('/unenroll', protect, admin, unenrollStudent);

module.exports = router; 