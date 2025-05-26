const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Don't send passwords
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot fetch users.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } // Don't send password
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot fetch user.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    
    // Validate user type
    if (type && !['admin', 'teacher', 'student'].includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be "admin", "teacher", or "student".'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      type: type || 'student' // Default to student if not provided
    });
    
    // Return user without password
    const userResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot create user.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    const { name, email, type, password } = req.body;
    
    // Validate type if provided
    if (type && !['admin', 'teacher', 'student'].includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be "admin", "teacher", or "student".'
      });
    }
    
    // Update user
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      type: type || user.type
    };
    
    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await user.update(updateData);
    
    // Send response without password
    const userResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot update user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // If the user is a student, manually clean up student-subject relationships
    if (user.type === 'student') {
      const { StudentSubject } = require('../models');
      await StudentSubject.destroy({ where: { studentId: userId } });
    }
    
    // Delete the user (cascade will handle other relationships)
    await user.destroy();
    
    res.json({ message: 'User and all related records deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot delete user.' });
  }
};

// Create default admin user if none exists
exports.createDefaultAdmin = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { type: 'admin' }
    });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      const password = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrator',
        email: 'admin@attendo.com',
        password,
        type: 'admin'
      });
      console.log('Default admin user created successfully with email: admin@attendo.com and password: admin123');
    } else {
      console.log('Admin user already exists, skipping creation.');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};
