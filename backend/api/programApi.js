const express = require('express');
const router = express.Router();
const { Program, Subject, User, Batch } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all programs (public)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = {};
    
    if (search) {
      filter = {
        ...filter,
        [Op.or]: [
          { programName: { [Op.like]: `%${search}%` } },
          { programType: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const programs = await Program.findAll({
      where: filter,
      order: [['programName', 'ASC']]
    });
    
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get program by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.status(200).json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new program (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { programType, programName, description } = req.body;
    
    // Validate input
    if (!programType || !programName) {
      return res.status(400).json({ message: 'Program type and name are required' });
    }
    
    // Check program type is valid
    if (!['UG', 'PG', 'PhD'].includes(programType)) {
      return res.status(400).json({ message: 'Program type must be UG, PG, or PhD' });
    }
    
    // Check if program name already exists
    const existingProgram = await Program.findOne({
      where: { programName }
    });
    
    if (existingProgram) {
      return res.status(400).json({ message: 'A program with this name already exists' });
    }
    
    // Create program
    const program = await Program.create({
      programType,
      programName,
      description
    });
    
    res.status(201).json({
      message: 'Program created successfully',
      program: {
        id: program.programId,
        type: program.programType,
        name: program.programName,
        description: program.description
      }
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update program (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { programType, programName, description } = req.body;
    
    // Find program
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Check for duplicate name if name is changing
    if (programName && programName !== program.programName) {
      const existingProgram = await Program.findOne({
        where: { programName }
      });
      
      if (existingProgram) {
        return res.status(400).json({ message: 'A program with this name already exists' });
      }
    }
    
    // Validate program type if provided
    if (programType && !['UG', 'PG', 'PhD'].includes(programType)) {
      return res.status(400).json({ message: 'Program type must be UG, PG, or PhD' });
    }
    
    // Update program
    await program.update({
      programType: programType || program.programType,
      programName: programName || program.programName,
      description: description !== undefined ? description : program.description
    });
    
    res.status(200).json({
      message: 'Program updated successfully',
      program: {
        id: program.programId,
        type: program.programType,
        name: program.programName,
        description: program.description
      }
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete program (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Check if program has subjects
    const subjects = await Subject.findAll({
      where: { programId: req.params.id }
    });
    
    if (subjects.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete program with associated subjects. Please remove subjects first.' 
      });
    }
    
    // Check if program has batches
    const batches = await Batch.findAll({
      where: { programId: req.params.id }
    });
    
    if (batches.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete program with associated batches. Please remove batches first.' 
      });
    }
    
    await program.destroy();
    
    res.status(200).json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subjects for a program (public)
router.get('/:id/subjects', async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const subjects = await Subject.findAll({
      where: { programId: req.params.id },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['userId', 'name', 'email']
        }
      ],
      order: [['semester', 'ASC'], ['subjectName', 'ASC']]
    });
    
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching program subjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get batches for a program (public)
router.get('/:id/batches', async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const batches = await Batch.findAll({
      where: { programId: req.params.id },
      order: [['batchName', 'ASC']]
    });
    
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching program batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add subject to program (admin only)
router.post('/:id/subjects', auth, adminOnly, async (req, res) => {
  try {
    const { subjectName, description, creditHours, semester, teacherId } = req.body;
    
    // Validate input
    if (!subjectName || !creditHours || !semester) {
      return res.status(400).json({ 
        message: 'Subject name, credit hours, and semester are required' 
      });
    }
    
    // Find program
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Validate semester
    if (semester > program.durationInSemesters) {
      return res.status(400).json({ 
        message: `Semester cannot be greater than program duration (${program.durationInSemesters} semesters)` 
      });
    }
    
    // Check if teacher exists if provided
    if (teacherId) {
      const teacher = await User.findOne({
        where: { userId: teacherId, type: 'teacher' }
      });
      
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
    }
    
    // Check if subject already exists in this program
    const existingSubject = await Subject.findOne({
      where: { 
        programId: req.params.id,
        subjectName
      }
    });
    
    if (existingSubject) {
      return res.status(400).json({ 
        message: 'A subject with this name already exists in this program' 
      });
    }
    
    // Create subject
    const subject = await Subject.create({
      subjectName,
      description,
      creditHours,
      semester,
      teacherId,
      programId: req.params.id
    });
    
    res.status(201).json({
      message: 'Subject added to program successfully',
      subject
    });
  } catch (error) {
    console.error('Error adding subject to program:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
