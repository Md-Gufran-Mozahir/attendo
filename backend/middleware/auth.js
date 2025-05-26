const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Basic authentication middleware 
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    
    req.user = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      type: user.type
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Teacher only middleware
exports.teacherOnly = (req, res, next) => {
  if (req.user.type !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
  }
  next();
};

// Student only middleware
exports.studentOnly = (req, res, next) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student privileges required.' });
  }
  next();
};

// Teacher or admin middleware
exports.teacherOrAdminOnly = (req, res, next) => {
  if (req.user.type !== 'teacher' && req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Teacher or admin privileges required.' });
  }
  next();
};

// Student or teacher middleware
exports.studentOrTeacherOnly = (req, res, next) => {
  if (req.user.type !== 'student' && req.user.type !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Student or teacher privileges required.' });
  }
  next();
}; 