const express = require('express');
const router = express.Router();
const studentRepository = require('../repositories/studentDetailsRepository');
const { auth } = require('../middleware/auth');

// GET /api/students
router.get('/', studentRepository.getAllStudents);

// GET /api/students/subjects - Get subjects for current student
router.get('/subjects', auth, studentRepository.getStudentSubjects);

// GET /api/students/:id
router.get('/:id', studentRepository.getStudentById);

// POST /api/students
router.post('/', studentRepository.createStudent);

// PUT /api/students/:id
router.put('/:id', studentRepository.updateStudent);

// DELETE /api/students/:id
router.delete('/:id', studentRepository.deleteStudent);

module.exports = router;
