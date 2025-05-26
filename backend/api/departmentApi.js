const express = require('express');
const router = express.Router();
const { Department, Program, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all departments (public)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = {};
    if (search) {
      filter = {
        [Op.or]: [
          { departmentName: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const departments = await Department.findAll({
      where: filter,
      order: [['departmentName', 'ASC']]
    });
    
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get department by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(200).json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new department (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { departmentName, description, facultyCode } = req.body;
    
    // Validate input
    if (!departmentName) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({
      where: { departmentName }
    });
    
    if (existingDepartment) {
      return res.status(400).json({ message: 'A department with this name already exists' });
    }
    
    // Create department
    const department = await Department.create({
      departmentName,
      description,
      facultyCode
    });
    
    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update department (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { departmentName, description, facultyCode } = req.body;
    
    // Find department
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check for duplicate name if name is changing
    if (departmentName && departmentName !== department.departmentName) {
      const existingDepartment = await Department.findOne({
        where: { departmentName }
      });
      
      if (existingDepartment) {
        return res.status(400).json({ message: 'A department with this name already exists' });
      }
    }
    
    // Update department
    await department.update({
      departmentName: departmentName || department.departmentName,
      description: description !== undefined ? description : department.description,
      facultyCode: facultyCode !== undefined ? facultyCode : department.facultyCode
    });
    
    res.status(200).json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete department (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if department has programs
    const programs = await Program.findAll({
      where: { departmentId: req.params.id }
    });
    
    if (programs.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with associated programs. Please reassign or delete programs first.' 
      });
    }
    
    await department.destroy();
    
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get programs in a department (public)
router.get('/:id/programs', async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const programs = await Program.findAll({
      where: { departmentId: req.params.id },
      order: [['programName', 'ASC']]
    });
    
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error fetching department programs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get faculty in a department (public)
router.get('/:id/faculty', async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const faculty = await User.findAll({
      where: { 
        departmentId: req.params.id,
        type: 'teacher'
      },
      attributes: ['userId', 'name', 'email', 'profilePicture'],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(faculty);
  } catch (error) {
    console.error('Error fetching department faculty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 