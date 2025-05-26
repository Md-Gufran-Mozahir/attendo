const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Teacher only middleware
const teacher = (req, res, next) => {
  if (req.user && req.user.type === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
  }
};

// Student only middleware
const student = (req, res, next) => {
  if (req.user && req.user.type === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student privileges required.' });
  }
};

// Teacher or admin middleware
const teacherOrAdmin = (req, res, next) => {
  if (req.user && (req.user.type === 'teacher' || req.user.type === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Teacher or admin privileges required.' });
  }
};

// Student or teacher middleware
const studentOrTeacher = (req, res, next) => {
  if (req.user && (req.user.type === 'student' || req.user.type === 'teacher')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student or teacher privileges required.' });
  }
};

// For backward compatibility with auth.js
const auth = protect;
const adminOnly = admin;
const teacherOnly = teacher;
const studentOnly = student;
const teacherOrAdminOnly = teacherOrAdmin;
const studentOrTeacherOnly = studentOrTeacher;

module.exports = { 
  protect, 
  admin,
  teacher,
  student,
  teacherOrAdmin,
  studentOrTeacher,
  // Backwards compatibility exports
  auth,
  adminOnly,
  teacherOnly,
  studentOnly,
  teacherOrAdminOnly,
  studentOrTeacherOnly
};
