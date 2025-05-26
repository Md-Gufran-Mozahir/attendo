const { StudentDetails, User, Subject, StudentSubject } = require('../models');

// Retrieve all student details
exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentDetails.findAll({
      include: [{ model: User }],
    });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Retrieve student details by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await StudentDetails.findByPk(id, {
      include: [{ model: User }],
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create new student details
exports.createStudent = async (req, res) => {
  try {
    const { 
      userId, 
      enrollment, 
      programId, 
      batchId, 
      currentSemester,
      photoUrl,
      guardianName,
      guardianEmail,
      guardianRelation
    } = req.body;

    // Check if the associated user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Associated user not found.' });
    }

    const newStudent = await StudentDetails.create({
      userId,
      enrollment,
      programId,
      batchId,
      currentSemester,
      photoUrl,
      guardianName,
      guardianEmail,
      guardianRelation
    });

    res.status(201).json({ message: 'Student details created successfully.', student: newStudent });
  } catch (error) {
    console.error('Error creating student details:', error);
    
    // Send validation errors to client if available
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update student details by ID
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      enrollment, 
      programId, 
      batchId,
      currentSemester,
      photoUrl,
      guardianName,
      guardianEmail,
      guardianRelation
    } = req.body;

    const student = await StudentDetails.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.enrollment = enrollment || student.enrollment;
    student.programId = programId || student.programId;
    student.batchId = batchId || student.batchId;
    student.currentSemester = currentSemester || student.currentSemester;
    student.photoUrl = photoUrl !== undefined ? photoUrl : student.photoUrl;
    student.guardianName = guardianName || student.guardianName;
    student.guardianEmail = guardianEmail || student.guardianEmail;
    student.guardianRelation = guardianRelation || student.guardianRelation;

    await student.save();
    res.status(200).json({ message: 'Student details updated successfully.', student });
  } catch (error) {
    console.error('Error updating student details:', error);
    
    // Send validation errors to client if available
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete student details by ID
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentDetails.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    await student.destroy();
    res.status(200).json({ message: 'Student details deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get subjects for currently logged in student
exports.getStudentSubjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Use direct Subject query with through table instead
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get subjects using the association defined in models/index.js
    const subjects = await user.getSubjects({
      attributes: ['subjectId', 'subjectName', 'subjectCode', 'semester'],
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['userId', 'name', 'email']
      }]
    });
    
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
