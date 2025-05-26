const express = require('express');
const router = express.Router();
const { Subject, User, Program, Session } = require('../models');
const { auth, adminOnly, teacherOrAdminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all subjects (optionally filtered by programId)
router.get('/', async (req, res) => {
  try {
    const { search, programId } = req.query;
    
    let filter = {};
    
    if (search) {
      filter = {
        ...filter,
        [Op.or]: [
          { subjectCode: { [Op.like]: `%${search}%` } },
          { subjectName: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (programId) {
      filter.programId = programId;
    }
    
    const subjects = await Subject.findAll({
      where: filter,
      include: [
        {
          model: Program,
          attributes: ['programId', 'programName', 'programType']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['userId', 'name', 'email']
        }
      ],
      order: [['subjectCode', 'ASC']]
    });
    
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [
        {
          model: Program,
          attributes: ['programId', 'programName', 'programType']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['userId', 'name', 'email']
        }
      ]
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new subject (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { subjectCode, subjectName, semester, programId, teacherId } = req.body;
    
    // Validate input
    if (!subjectCode || !subjectName || !semester || !programId) {
      return res.status(400).json({ 
        message: 'Subject code, name, semester, and program ID are required' 
      });
    }
    
    // Check if program exists
    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Check if subject code already exists
    const existingSubject = await Subject.findOne({
      where: { subjectCode }
    });
    
    if (existingSubject) {
      return res.status(400).json({ message: 'A subject with this code already exists' });
    }
    
    // Check if teacher exists if provided
    if (teacherId) {
      const teacher = await User.findOne({
        where: { 
          userId: teacherId,
          type: 'teacher'
        }
      });
      
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
    }
    
    // Create subject
    const subject = await Subject.create({
      subjectCode,
      subjectName,
      semester,
      programId,
      teacherId: teacherId || null
    });
    
    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        subjectId: subject.subjectId,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        semester: subject.semester,
        programId: subject.programId,
        teacherId: subject.teacherId
      }
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update subject (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { subjectCode, subjectName, semester, programId, teacherId } = req.body;
    
    // Find subject
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check for duplicate code if code is changing
    if (subjectCode && subjectCode !== subject.subjectCode) {
      const existingSubject = await Subject.findOne({
        where: { subjectCode }
      });
      
      if (existingSubject) {
        return res.status(400).json({ message: 'A subject with this code already exists' });
      }
    }
    
    // Check if program exists if provided
    if (programId) {
      const program = await Program.findByPk(programId);
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
    }
    
    // Check if teacher exists if provided
    if (teacherId) {
      const teacher = await User.findOne({
        where: { 
          userId: teacherId,
          type: 'teacher'
        }
      });
      
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
    }
    
    // Update subject
    await subject.update({
      subjectCode: subjectCode || subject.subjectCode,
      subjectName: subjectName || subject.subjectName,
      semester: semester !== undefined ? semester : subject.semester,
      programId: programId || subject.programId,
      teacherId: teacherId !== undefined ? teacherId : subject.teacherId
    });
    
    res.status(200).json({
      message: 'Subject updated successfully',
      subject: {
        subjectId: subject.subjectId,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        semester: subject.semester,
        programId: subject.programId,
        teacherId: subject.teacherId
      }
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete subject (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if subject has sessions
    const sessions = await Session.findAll({
      where: { subjectId: req.params.id }
    });
    
    if (sessions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete subject with active sessions. Please remove sessions first.' 
      });
    }
    
    await subject.destroy();
    
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sessions for a subject (teacher/admin only)
router.get('/:id/sessions', auth, teacherOrAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status } = req.query;
    
    // Verify subject exists
    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // For teachers, verify they teach this subject
    if (req.user.type === 'teacher' && subject.teacherId !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to view sessions for this subject' });
    }
    
    // Build query filters
    let filter = { subjectId: id };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      filter.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      filter.date = { [Op.lte]: new Date(endDate) };
    }
    
    // Get sessions
    const sessions = await Session.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['userId', 'name', 'email']
        }
      ],
      order: [['date', 'DESC'], ['startTime', 'DESC']]
    });
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching subject sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign teacher to subject (admin only)
router.post('/:id/teacher', auth, adminOnly, async (req, res) => {
  try {
    const { teacherId } = req.body;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const teacher = await User.findOne({
      where: { 
        userId: teacherId,
        type: 'teacher'
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await subject.update({ teacherId });
    
    res.status(200).json({
      message: 'Teacher assigned to subject successfully',
      subject: {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        teacherId: subject.teacherId
      }
    });
  } catch (error) {
    console.error('Error assigning teacher to subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get students enrolled in a subject (admin only)
router.get('/:id/students', auth, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Get all students enrolled in this subject
    const students = await subject.getUsers({
      where: { type: 'student' },
      attributes: ['userId', 'name', 'email', 'type'],
      joinTableAttributes: [] // Don't include the join table fields
    });
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching subject students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enroll a student in a subject (admin only)
router.post('/:id/students', auth, adminOnly, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    // Verify subject exists
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Verify student exists
    const student = await User.findOne({
      where: { userId: studentId, type: 'student' }
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is already enrolled
    const isEnrolled = await subject.hasUser(student);
    if (isEnrolled) {
      return res.status(400).json({ message: 'Student is already enrolled in this subject' });
    }
    
    // Enroll student
    await subject.addUser(student);
    
    res.status(201).json({ 
      message: 'Student enrolled in subject successfully',
      studentId: student.userId,
      subjectId: subject.subjectId
    });
  } catch (error) {
    console.error('Error enrolling student in subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a student from a subject (admin only)
router.delete('/:subjectId/students/:studentId', auth, adminOnly, async (req, res) => {
  try {
    const { subjectId, studentId } = req.params;
    
    // Verify subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Verify student exists
    const student = await User.findOne({
      where: { userId: studentId, type: 'student' }
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is enrolled
    const isEnrolled = await subject.hasUser(student);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'Student is not enrolled in this subject' });
    }
    
    // Remove student
    await subject.removeUser(student);
    
    res.status(200).json({ 
      message: 'Student removed from subject successfully' 
    });
  } catch (error) {
    console.error('Error removing student from subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
