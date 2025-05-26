 const asyncHandler = require('express-async-handler');
const StudentDetails = require('../models/studentDetails');
const User = require('../models/user');
const Subject = require('../models/subject');
const StudentSubject = require('../models/studentSubject');
const { Op } = require('sequelize');

// @desc    Get students enrolled in a subject
// @route   GET /api/studentsubjects/subject/:subjectId
// @access  Private
const getStudentsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  
  // Find all student IDs enrolled in this subject
  const enrollments = await StudentSubject.findAll({
    where: { subjectId }
  });
  
  const studentIds = enrollments.map(enrollment => enrollment.studentId);
  
  if (studentIds.length === 0) {
    return res.json([]);
  }
  
  // Get student user details using the array of student IDs
  const students = await User.findAll({
    where: { userId: { [Op.in]: studentIds } },
    attributes: ['userId', 'name', 'email'],
    include: [{
      model: StudentDetails,
      attributes: ['enrollment']
    }]
  });
  
  // Format the response to include roll number
  const formattedStudents = students.map(student => ({
    userId: student.userId,
    name: student.name,
    email: student.email,
    rollNumber: student.StudentDetail ? student.StudentDetail.enrollment : null
  }));
  
  res.json(formattedStudents);
});

// @desc    Get subjects a student is enrolled in
// @route   GET /api/studentsubjects/student/:studentId
// @access  Private
const getSubjectsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const enrollments = await StudentSubject.findAll({
    where: { studentId },
    include: [{
      model: Subject,
      attributes: ['subjectName', 'subjectCode']
    }]
  });
  
  const subjects = enrollments.map(enrollment => enrollment.Subject);
  
  res.json(subjects);
});

// @desc    Enroll a student in a subject
// @route   POST /api/studentsubjects/enroll
// @access  Private/Admin
const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, subjectId } = req.body;
  
  // Check if student exists
  const student = await User.findByPk(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check if subject exists
  const subject = await Subject.findByPk(subjectId);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  
  // Check if already enrolled
  const alreadyEnrolled = await StudentSubject.findOne({
    where: {
      studentId,
      subjectId
    }
  });
  
  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Student is already enrolled in this subject');
  }
  
  // Create enrollment
  const enrollment = await StudentSubject.create({
    studentId,
    subjectId
  });
  
  res.status(201).json({ message: 'Student enrolled successfully' });
});

// @desc    Remove a student from a subject
// @route   DELETE /api/studentsubjects/unenroll
// @access  Private/Admin
const unenrollStudent = asyncHandler(async (req, res) => {
  const { studentId, subjectId } = req.body;
  
  const enrollment = await StudentSubject.destroy({
    where: {
      studentId,
      subjectId
    }
  });
  
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  
  res.json({ message: 'Student unenrolled successfully' });
});

module.exports = {
  getStudentsBySubject,
  getSubjectsByStudent,
  enrollStudent,
  unenrollStudent
}; 