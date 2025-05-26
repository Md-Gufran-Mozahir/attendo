const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Program = require('../models/program');
const TeacherProgram = require('../models/teacherProgram');
const { Op } = require('sequelize');

// @desc    Get teachers assigned to a program
// @route   GET /api/teacher-programs/program/:programId
// @access  Private
const getTeachersByProgram = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  
  // Find all teacher IDs assigned to this program
  const assignments = await TeacherProgram.findAll({
    where: { programId }
  });
  
  const teacherIds = assignments.map(assignment => assignment.teacherId);
  
  if (teacherIds.length === 0) {
    return res.json([]);
  }
  
  // Get teacher details using the array of teacher IDs
  const teachers = await User.findAll({
    where: { 
      userId: { [Op.in]: teacherIds },
      type: 'teacher'
    },
    attributes: ['userId', 'name', 'email']
  });
  
  res.json(teachers);
});

// @desc    Get programs assigned to a teacher
// @route   GET /api/teacher-programs/teacher/:teacherId
// @access  Private
const getProgramsByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  
  const assignments = await TeacherProgram.findAll({
    where: { teacherId },
    include: [{
      model: Program,
      attributes: ['programId', 'programName', 'programType']
    }]
  });
  
  const programs = assignments.map(assignment => assignment.Program);
  
  res.json(programs);
});

// @desc    Assign a teacher to a program
// @route   POST /api/teacher-programs/assign
// @access  Private/Admin
const assignTeacherToProgram = asyncHandler(async (req, res) => {
  const { teacherId, programId } = req.body;
  
  // Check if teacher exists and is a teacher
  const teacher = await User.findOne({ 
    where: { 
      userId: teacherId,
      type: 'teacher'
    }
  });
  
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  
  // Check if program exists
  const program = await Program.findByPk(programId);
  if (!program) {
    res.status(404);
    throw new Error('Program not found');
  }
  
  // Check if already assigned
  const alreadyAssigned = await TeacherProgram.findOne({
    where: {
      teacherId,
      programId
    }
  });
  
  if (alreadyAssigned) {
    res.status(400);
    throw new Error('Teacher is already assigned to this program');
  }
  
  // Create assignment
  await TeacherProgram.create({
    teacherId,
    programId
  });
  
  res.status(201).json({ message: 'Teacher assigned to program successfully' });
});

// @desc    Remove a teacher from a program
// @route   DELETE /api/teacher-programs/unassign
// @access  Private/Admin
const unassignTeacherFromProgram = asyncHandler(async (req, res) => {
  const { teacherId, programId } = req.body;
  
  const assignment = await TeacherProgram.destroy({
    where: {
      teacherId,
      programId
    }
  });
  
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  
  res.json({ message: 'Teacher unassigned from program successfully' });
});

// @desc    Get all teacher-program assignments
// @route   GET /api/teacher-programs
// @access  Private/Admin
const getAllTeacherProgramAssignments = asyncHandler(async (req, res) => {
  const assignments = await TeacherProgram.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'name', 'email'],
        where: { type: 'teacher' }
      },
      {
        model: Program,
        attributes: ['programId', 'programName', 'programType']
      }
    ]
  });
  
  res.json(assignments);
});

module.exports = {
  getTeachersByProgram,
  getProgramsByTeacher,
  assignTeacherToProgram,
  unassignTeacherFromProgram,
  getAllTeacherProgramAssignments
}; 