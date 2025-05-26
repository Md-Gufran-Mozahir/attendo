const { Session, Subject, User, Batch, UniversityLocation, StudentSubject } = require('../models');
const { Op } = require('sequelize');

// Retrieve all sessions
exports.getAllSessions = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const { subjectId, teacherId, batchId, status, startDate, endDate } = req.query;
    
    // Build query filters
    const filter = {};
    
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    if (batchId) filter.batchId = batchId;
    if (status) filter.status = status;
    
    // Add date range filter if provided
    if (startDate && endDate) {
      filter.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      filter.startTime = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      filter.startTime = { [Op.lte]: new Date(endDate) };
    }
    
    const sessions = await Session.findAll({
      where: filter,
      include: [
        { model: Subject },
        { model: User, as: 'teacher', attributes: ['userId', 'name', 'email'] },
        { model: Batch },
        { model: UniversityLocation }
      ],
      order: [['startTime', 'DESC']]
    });
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Retrieve a session by ID
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByPk(id, {
      include: [
        { model: Subject },
        { model: User, as: 'teacher', attributes: ['userId', 'name', 'email'] },
        { model: Batch },
        { model: UniversityLocation }
      ]
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// === Student Functions ===

// Get active sessions for the logged-in student
exports.getActiveSessionsForStudent = async (req, res) => {
  try {
    const studentId = req.user.userId;
    
    // Get current date
    const today = new Date();
    console.log('Current date:', today);
    
    // First get the subjects this student is enrolled in
    const enrolledSubjects = await StudentSubject.findAll({
      where: { studentId },
      attributes: ['subjectId']
    });
    
    const subjectIds = enrolledSubjects.map(subject => subject.subjectId);
    console.log('Student enrolled subjects:', subjectIds);
    
    if (subjectIds.length === 0) {
      console.log('Student has no enrolled subjects');
      return res.status(200).json([]);
    }
    
    // Now find sessions for these subjects
    const sessions = await Session.findAll({
      where: {
        startTime: {
          [Op.gte]: today
        },
        status: 'Open',
        subjectId: {
          [Op.in]: subjectIds
        }
      },
      include: [
        {
          model: Subject,
          include: [
            { model: User, as: 'teacher', attributes: ['userId', 'name', 'email'] }
          ]
        },
        { model: User, as: 'teacher', attributes: ['userId', 'name', 'email'] },
        { model: Batch },
        { model: UniversityLocation }
      ],
      order: [['startTime', 'ASC']]
    });
    
    console.log(`Found ${sessions.length} active sessions for student ${studentId}`);
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching active sessions for student:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// === Teacher Functions ===

// Get sessions for the logged-in teacher
exports.getTeacherSessions = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { status, date } = req.query;
    
    // Build query filters
    const filter = { teacherId };
    
    if (status) {
      filter.status = status;
    }
    
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.startTime = {
        [Op.gte]: selectedDate,
        [Op.lt]: nextDay
      };
    }
    
    const sessions = await Session.findAll({
      where: filter,
      include: [
        { model: Subject },
        { model: Batch },
        { model: UniversityLocation }
      ],
      order: [['startTime', 'DESC']]
    });
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching teacher sessions:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new session (teacher only)
exports.createSession = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { subjectId, batchId, programId, startTime, endTime, locationId } = req.body;
    
    // Validate required fields
    if (!subjectId || !batchId || !programId || !startTime || !locationId) {
      return res.status(400).json({ 
        message: 'Subject ID, batch ID, program ID, start time, and location ID are required.' 
      });
    }
    
    // Check if subject exists and teacher is assigned to it
    const subject = await Subject.findOne({
      where: { subjectId }
    });
    
    if (!subject) {
      return res.status(404).json({ 
        message: 'Subject not found.' 
      });
    }
    
    if (subject.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ 
        message: 'You do not have permission to create a session for this subject.' 
      });
    }
    
    // Create new session
    const session = await Session.create({
      subjectId,
      batchId,
      programId,
      teacherId,
      startTime,
      endTime,
      locationId,
      status: 'Open'
    });
    
    res.status(201).json({
      message: 'Session created successfully.',
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update session details (teacher only)
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;
    const { subjectId, batchId, programId, startTime, endTime, locationId, status } = req.body;
    
    // Find the session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    
    // Check if user is authorized to update this session
    if (session.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this session.' });
    }
    
    // Update session
    await session.update({
      subjectId: subjectId || session.subjectId,
      batchId: batchId || session.batchId,
      programId: programId || session.programId,
      startTime: startTime || session.startTime,
      endTime: endTime || session.endTime,
      locationId: locationId || session.locationId,
      status: status || session.status
    });
    
    res.status(200).json({
      message: 'Session updated successfully.',
      session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Close a session (teacher only)
exports.closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;
    
    // Find the session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    
    // Check if user is authorized to close this session
    if (session.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to close this session.' });
    }
    
    // Check if session is already closed
    if (session.status === 'Closed') {
      return res.status(400).json({ message: 'Session is already closed.' });
    }
    
    // Update session status to closed and set end time if not already set
    await session.update({
      status: 'Closed',
      endTime: session.endTime || new Date()
    });
    
    res.status(200).json({
      message: 'Session closed successfully.',
      session
    });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// === Admin Functions ===

// Delete a session (admin only)
exports.deleteSession = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete sessions.' });
    }
    
    const { id } = req.params;
    
    // Find the session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    
    // Delete the session
    await session.destroy();
    
    res.status(200).json({
      message: 'Session deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
