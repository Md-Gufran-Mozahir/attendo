const express = require('express');
const router = express.Router();
const { Batch, Program, User, UserBatch } = require('../models');
const { auth, adminOnly, teacherOrAdminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all batches (public)
router.get('/', async (req, res) => {
  try {
    const { search, active } = req.query;
    
    let filter = {};
    
    if (search) {
      filter = {
        ...filter,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (active !== undefined) {
      filter = {
        ...filter,
        isActive: active === 'true'
      };
    }
    
    const batches = await Batch.findAll({
      where: filter,
      order: [['startDate', 'DESC']]
    });
    
    // Map the response to include batchName for frontend compatibility
    const mappedBatches = batches.map(batch => ({
      ...batch.toJSON(),
      batchName: batch.name // Add batchName field mapping to name
    }));
    
    res.status(200).json(mappedBatches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Add batchName field for frontend compatibility
    const batchData = batch.toJSON();
    batchData.batchName = batch.name;
    
    res.status(200).json(batchData);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new batch (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    
    // Validate input
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Batch name, start date, and end date are required' });
    }
    
    // Check if batch name already exists
    const existingBatch = await Batch.findOne({
      where: { name: name }
    });
    
    if (existingBatch) {
      return res.status(400).json({ message: 'A batch with this name already exists' });
    }
    
    // Create batch
    const batch = await Batch.create({
      name,
      startDate,
      endDate
    });
    
    res.status(201).json({
      message: 'Batch created successfully',
      batch: {
        id: batch.batchId,
        name: batch.name,
        startDate: batch.startDate,
        endDate: batch.endDate
      }
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update batch (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    
    // Find batch
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check for duplicate name if name is changing
    if (name && name !== batch.name) {
      const existingBatch = await Batch.findOne({
        where: { name: name }
      });
      
      if (existingBatch) {
        return res.status(400).json({ message: 'A batch with this name already exists' });
      }
    }
    
    // Update batch
    await batch.update({
      name: name || batch.name,
      startDate: startDate || batch.startDate,
      endDate: endDate || batch.endDate
    });
    
    res.status(200).json({
      message: 'Batch updated successfully',
      batch: {
        id: batch.batchId,
        name: batch.batchName,
        startDate: batch.startDate,
        endDate: batch.endDate
      }
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete batch (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if batch has students
    const students = await UserBatch.findAll({
      where: { batchId: req.params.id }
    });
    
    if (students.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete batch with associated students. Please remove students first.'
      });
    }
    
    await batch.destroy();
    
    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get students in a batch (admin/teacher only)
router.get('/:id/students', auth, teacherOrAdminOnly, async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    const students = await User.findAll({
      include: [
        {
          model: UserBatch,
          where: { batchId: req.params.id },
          attributes: ['rollNumber']
        }
      ],
      where: { type: 'student' },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching batch students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add student to batch (admin only)
router.post('/:id/students', auth, adminOnly, async (req, res) => {
  try {
    const { userId, rollNumber } = req.body;
    
    // Validate input
    if (!userId || !rollNumber) {
      return res.status(400).json({ message: 'User ID and roll number are required' });
    }
    
    // Find batch
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if user exists and is a student
    const user = await User.findOne({
      where: { userId, type: 'student' }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is already in this batch
    const existingEnrollment = await UserBatch.findOne({
      where: { userId, batchId: req.params.id }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already enrolled in this batch' });
    }
    
    // Check if roll number is already assigned in this batch
    const existingRollNumber = await UserBatch.findOne({
      where: { rollNumber, batchId: req.params.id }
    });
    
    if (existingRollNumber) {
      return res.status(400).json({ message: 'Roll number is already assigned in this batch' });
    }
    
    // Add student to batch
    const enrollment = await UserBatch.create({
      userId,
      batchId: req.params.id,
      rollNumber
    });
    
    res.status(201).json({
      message: 'Student added to batch successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error adding student to batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove student from batch (admin only)
router.delete('/:batchId/students/:userId', auth, adminOnly, async (req, res) => {
  try {
    const { batchId, userId } = req.params;
    
    // Check if enrollment exists
    const enrollment = await UserBatch.findOne({
      where: { userId, batchId }
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Student is not enrolled in this batch' });
    }
    
    await enrollment.destroy();
    
    res.status(200).json({ message: 'Student removed from batch successfully' });
  } catch (error) {
    console.error('Error removing student from batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Increment semester for batch (admin only)
router.post('/:id/increment-semester', auth, adminOnly, async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Check if batch has reached maximum semesters (hardcoded to 8 as a safety)
    if (batch.currentSemester >= 8) {
      return res.status(400).json({ 
        message: `Cannot increment semester. Batch has already completed all 8 semesters.` 
      });
    }
    
    // Increment semester
    await batch.update({
      currentSemester: batch.currentSemester + 1
    });
    
    res.status(200).json({
      message: 'Semester incremented successfully',
      batch
    });
  } catch (error) {
    console.error('Error incrementing semester:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 