const express = require('express');
const router = express.Router();
const { 
  getTeachersByProgram, 
  getProgramsByTeacher, 
  assignTeacherToProgram, 
  unassignTeacherFromProgram,
  getAllTeacherProgramAssignments
} = require('../controllers/teacherProgramController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes for teacher-program operations
router.get('/', protect, getAllTeacherProgramAssignments);
router.get('/program/:programId', protect, getTeachersByProgram);
router.get('/teacher/:teacherId', protect, getProgramsByTeacher);
router.post('/assign', protect, admin, assignTeacherToProgram);
router.delete('/unassign', protect, admin, unassignTeacherFromProgram);

module.exports = router; 