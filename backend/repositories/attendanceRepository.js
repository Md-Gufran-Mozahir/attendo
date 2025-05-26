const { Attendance, Session, User, Subject, Batch, StudentDetails } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const locationRepo = require('./locationRepository');
const nodemailer = require('nodemailer');

// === Common Functions ===

// Retrieve an attendance record by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// === Student Functions ===

// Mark attendance for a session with geolocation
exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, latitude, longitude } = req.body;
    const studentId = req.user.userId;

    // Validate input
    if (!sessionId || !latitude || !longitude) {
      return res.status(400).json({ message: 'Session ID, latitude, and longitude are required' });
    }

    // Check if session exists and is open
    const session = await Session.findByPk(sessionId, {
      include: [{ model: User, as: 'teacher' }]
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.status !== 'Open') {
      return res.status(400).json({ message: 'This session is closed for attendance' });
    }

    // Check if student is already marked for this session
    const existingAttendance = await Attendance.findOne({
      where: { sessionId, studentId }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'You have already marked attendance for this session',
        status: existingAttendance.status
      });
    }

    // Verify location is within campus boundaries
    const locationCheck = await locationRepo.verifyLocationWithinCampus({
      body: { latitude, longitude, locationId: session.locationId }
    }, { json: () => {} });
    
    // Set status based on location
    let status = 'Pending';
    if (locationCheck && locationCheck.isWithinBoundary) {
      status = 'Present';
    }

    // Create attendance record
    const attendance = await Attendance.create({
      sessionId,
      studentId,
      attendanceDate: new Date(),
      status,
      latitude,
      longitude
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
      locationCheck
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

// Get attendance history for logged-in student
exports.getStudentAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const attendanceRecords = await Attendance.findAll({
      where: { studentId },
      include: [
        {
          model: Session,
          include: [
            { model: Subject },
            { model: User, as: 'teacher' }
          ]
        }
      ],
      order: [['attendanceDate', 'DESC']]
    });

    // Format the response
    const formattedRecords = attendanceRecords.map(record => ({
      attendanceId: record.attendanceId,
      date: record.attendanceDate,
      status: record.status,
      subject: record.Session.Subject.subjectName,
      teacher: record.Session.teacher.name,
      sessionId: record.sessionId
    }));

    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({ message: 'Failed to fetch attendance history' });
  }
};

// Get attendance statistics for logged-in student
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get all attendance records for the student
    const attendanceRecords = await Attendance.findAll({
      where: { studentId },
      include: [
        {
          model: Session,
          include: [{ model: Subject }]
        }
      ]
    });

    // Calculate statistics per subject
    const subjectStats = {};
    
    attendanceRecords.forEach(record => {
      const subjectName = record.Session.Subject.subjectName;
      const subjectId = record.Session.Subject.subjectId;
      
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subjectName,
          total: 0,
          present: 0,
          absent: 0,
          pending: 0
        };
      }
      
      subjectStats[subjectId].total++;
      
      if (record.status === 'Present') {
        subjectStats[subjectId].present++;
      } else if (record.status === 'Absent') {
        subjectStats[subjectId].absent++;
      } else if (record.status === 'Pending') {
        subjectStats[subjectId].pending++;
      }
    });

    // Calculate percentages
    Object.keys(subjectStats).forEach(subjectId => {
      const stats = subjectStats[subjectId];
      stats.percentage = stats.total > 0 
        ? Math.round((stats.present / stats.total) * 100) 
        : 0;
    });

    res.json({
      studentId,
      stats: Object.values(subjectStats)
    });
  } catch (error) {
    console.error('Error calculating attendance statistics:', error);
    res.status(500).json({ message: 'Failed to calculate attendance statistics' });
  }
};

// === Teacher Functions ===

// Get attendance for a specific session
exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.userId;

    // Verify the session belongs to this teacher
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this session' });
    }
    
    // Get all attendance records for this session
    const attendanceRecords = await Attendance.findAll({
      where: { sessionId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['userId', 'name', 'email'],
          include: [
            {
              model: StudentDetails,
              attributes: ['enrollment']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Format the response
    const formattedRecords = attendanceRecords.map(record => ({
      attendanceId: record.attendanceId,
      student: {
        userId: record.student.userId,
        name: record.student.name,
        email: record.student.email,
        rollNumber: record.student.StudentDetails ? record.student.StudentDetails.enrollment : null
      },
      status: record.status,
      createdAt: record.createdAt,
      latitude: record.latitude,
      longitude: record.longitude,
      teacherComment: record.teacherComment
    }));
    
    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
};

// Update attendance status for a student
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, teacherComment } = req.body;
    const teacherId = req.user.userId;
    
    // Validate input
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Find attendance record
    const attendanceRecord = await Attendance.findByPk(id, {
      include: [{ model: Session }]
    });
    
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Verify teacher has permission to update this record
    if (attendanceRecord.Session.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this attendance record' });
    }
    
    // Update record
    await attendanceRecord.update({ 
      status, 
      teacherComment: teacherComment || attendanceRecord.teacherComment
    });
    
    res.json({ 
      message: 'Attendance status updated successfully',
      attendanceRecord
    });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    res.status(500).json({ message: 'Failed to update attendance status' });
  }
};

// Verify all pending attendance records for a session
exports.verifyAllAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.userId;
    
    // Verify the session belongs to this teacher
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to modify this session' });
    }
    
    // Update all pending attendance records to Present
    const result = await Attendance.update(
      { status: 'Present' },
      { 
        where: { 
          sessionId,
          status: 'Pending'
        }
      }
    );
    
    res.json({ 
      message: 'All pending attendance records verified successfully',
      updated: result[0]  // Number of records updated
    });
  } catch (error) {
    console.error('Error verifying attendance records:', error);
    res.status(500).json({ message: 'Failed to verify attendance records' });
  }
};

// Get attendance report for teacher's subjects
exports.getTeacherAttendanceReport = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { subjectId, startDate, endDate } = req.query;

    // Validate input
    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    // Verify the subject belongs to this teacher
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    if (subject.teacherId !== teacherId && req.user.type !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this subject' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.attendanceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateFilter.attendanceDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      dateFilter.attendanceDate = { [Op.lte]: new Date(endDate) };
    }

    // Get sessions for this subject
    const sessions = await Session.findAll({
      where: { subjectId, teacherId },
      attributes: ['sessionId']
    });

    const sessionIds = sessions.map(s => s.sessionId);

    // Get attendance records
    const attendanceRecords = await Attendance.findAll({
      where: {
        sessionId: { [Op.in]: sessionIds },
        ...dateFilter
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['userId', 'name', 'email']
        },
        { model: Session }
      ]
    });

    // Calculate statistics
    const studentStats = {};
    attendanceRecords.forEach(record => {
      const studentId = record.studentId;
      const studentName = record.student.name;
      
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId,
          studentName,
          total: 0,
          present: 0,
          absent: 0,
          pending: 0
        };
      }
      
      studentStats[studentId].total++;
      
      if (record.status === 'Present') {
        studentStats[studentId].present++;
      } else if (record.status === 'Absent') {
        studentStats[studentId].absent++;
      } else if (record.status === 'Pending') {
        studentStats[studentId].pending++;
      }
    });

    // Calculate percentages
    Object.keys(studentStats).forEach(studentId => {
      const stats = studentStats[studentId];
      stats.percentage = stats.total > 0 
        ? Math.round((stats.present / stats.total) * 100) 
        : 0;
    });

    res.json({
      subjectId,
      subjectName: subject.subjectName,
      studentStats: Object.values(studentStats),
      records: attendanceRecords
    });
  } catch (error) {
    console.error('Error generating teacher attendance report:', error);
    res.status(500).json({ message: 'Failed to generate attendance report' });
  }
};

// Get attendance summary for a teacher's subjects
exports.getTeacherAttendanceSummary = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    
    // Get all subjects taught by this teacher
    const subjects = await Subject.findAll({
      where: { teacherId },
      attributes: ['subjectId', 'subjectName', 'subjectCode']
    });
    
    if (subjects.length === 0) {
      return res.json({ teacherId, subjects: [] });
    }
    
    const subjectIds = subjects.map(subject => subject.subjectId);
    
    // Get sessions for these subjects
    const sessions = await Session.findAll({
      where: { 
        subjectId: { [Op.in]: subjectIds }
      },
      attributes: ['sessionId', 'subjectId', 'startTime', 'status']
    });
    
    const sessionIds = sessions.map(session => session.sessionId);
    
    // Get attendance records for these sessions
    const attendanceRecords = await Attendance.findAll({
      where: {
        sessionId: { [Op.in]: sessionIds }
      },
      attributes: ['sessionId', 'status']
    });
    
    // Group sessions by subject
    const subjectSessions = {};
    sessions.forEach(session => {
      if (!subjectSessions[session.subjectId]) {
        subjectSessions[session.subjectId] = {
          total: 0,
          completed: 0
        };
      }
      
      subjectSessions[session.subjectId].total++;
      if (session.status === 'Closed') {
        subjectSessions[session.subjectId].completed++;
      }
    });
    
    // Group attendance by session
    const sessionAttendance = {};
    attendanceRecords.forEach(record => {
      if (!sessionAttendance[record.sessionId]) {
        sessionAttendance[record.sessionId] = {
          total: 0,
          present: 0,
          absent: 0,
          pending: 0
        };
      }
      
      sessionAttendance[record.sessionId].total++;
      
      if (record.status === 'Present') {
        sessionAttendance[record.sessionId].present++;
      } else if (record.status === 'Absent') {
        sessionAttendance[record.sessionId].absent++;
      } else if (record.status === 'Pending') {
        sessionAttendance[record.sessionId].pending++;
      }
    });
    
    // Compile subject summary
    const subjectSummary = subjects.map(subject => {
      const sessionStats = subjectSessions[subject.subjectId] || { total: 0, completed: 0 };
      
      // Get all session IDs for this subject
      const subjectSessionIds = sessions
        .filter(s => s.subjectId === subject.subjectId)
        .map(s => s.sessionId);
      
      // Calculate attendance for this subject
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalPending = 0;
      let totalAttendance = 0;
      
      subjectSessionIds.forEach(sessionId => {
        if (sessionAttendance[sessionId]) {
          totalPresent += sessionAttendance[sessionId].present;
          totalAbsent += sessionAttendance[sessionId].absent;
          totalPending += sessionAttendance[sessionId].pending;
          totalAttendance += sessionAttendance[sessionId].total;
        }
      });
      
      return {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        sessions: sessionStats.total,
        completedSessions: sessionStats.completed,
        attendance: {
          total: totalAttendance,
          present: totalPresent,
          absent: totalAbsent,
          pending: totalPending,
          percentage: totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0
        }
      };
    });
    
    res.json({
      teacherId,
      subjects: subjectSummary
    });
  } catch (error) {
    console.error('Error fetching teacher attendance summary:', error);
    res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
};

// === Admin Functions ===

// Retrieve all attendance records with filtering options
exports.getAllAttendances = async (req, res) => {
  try {
    // Check if user is admin or teacher
    if (req.user.type !== 'admin' && req.user.type !== 'teacher') {
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }

    // Handle query parameters for filtering
    const { sessionId, studentId, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (sessionId) filter.sessionId = sessionId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    
    // Add date range filter if provided
    if (startDate && endDate) {
      filter.attendanceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      filter.attendanceDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      filter.attendanceDate = { [Op.lte]: new Date(endDate) };
    }

    // Get attendance records with includes
    const attendances = await Attendance.findAll({
      where: filter,
      include: [
        {
          model: Session,
          include: [
            { model: Subject },
            { model: User, as: 'teacher' }
          ]
        },
        {
          model: User,
          as: 'student',
          attributes: ['userId', 'name', 'email']
        }
      ],
      order: [['attendanceDate', 'DESC']]
    });

    res.status(200).json(attendances);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new attendance record (admin only)
exports.createAttendance = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create attendance records manually' });
    }

    const { studentId, sessionId, status, latitude, longitude, attendanceDate } = req.body;

    // Validate input
    if (!studentId || !sessionId || !status) {
      return res.status(400).json({ message: 'Student ID, session ID, and status are required' });
    }

    // Check if session exists
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if student exists
    const student = await User.findByPk(studentId);
    if (!student || student.type !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if record already exists
    const existingRecord = await Attendance.findOne({
      where: { studentId, sessionId }
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance record already exists for this student in this session' });
    }

    // Create attendance record
    const newAttendance = await Attendance.create({
      studentId,
      sessionId,
      status,
      latitude: latitude || null,
      longitude: longitude || null,
      attendanceDate: attendanceDate || new Date()
    });

    res.status(201).json({ 
      message: 'Attendance record created successfully.', 
      attendance: newAttendance 
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete an attendance record by ID (admin only)
exports.deleteAttendance = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete attendance records' });
    }

    const { id } = req.params;

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    await attendance.destroy();
    res.status(200).json({ message: 'Attendance record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get overall attendance report across programs/batches
exports.getOverallAttendanceReport = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access overall attendance reports' });
    }

    const { programId, batchId, startDate, endDate } = req.query;

    // Validate input
    if (!(programId || batchId)) {
      return res.status(400).json({ message: 'Program ID or Batch ID is required' });
    }

    // Build query based on provided filters
    let query = `
      SELECT 
        u.userId, u.name, u.email, 
        s.subjectId, s.subjectName, 
        COUNT(a.attendanceId) as totalSessions,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as presentCount,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absentCount,
        SUM(CASE WHEN a.status = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
        ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.attendanceId)) * 100) as attendancePercentage
      FROM Users u
      JOIN Attendances a ON u.userId = a.studentId
      JOIN Sessions sess ON a.sessionId = sess.sessionId
      JOIN Subjects s ON sess.subjectId = s.subjectId
      WHERE u.type = 'student'
    `;

    const queryParams = [];

    // Add program filter
    if (programId) {
      query += ` AND s.programId = ?`;
      queryParams.push(programId);
    }

    // Add batch filter
    if (batchId) {
      query += ` AND sess.batchId = ?`;
      queryParams.push(batchId);
    }

    // Add date range filter
    if (startDate && endDate) {
      query += ` AND a.attendanceDate BETWEEN ? AND ?`;
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND a.attendanceDate >= ?`;
      queryParams.push(startDate);
    } else if (endDate) {
      query += ` AND a.attendanceDate <= ?`;
      queryParams.push(endDate);
    }

    // Group by student and subject
    query += ` GROUP BY u.userId, s.subjectId`;

    // Execute the query
    const [results] = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error generating overall attendance report:', error);
    res.status(500).json({ message: 'Failed to generate overall attendance report' });
  }
};

// Send attendance reports to guardians
exports.sendAttendanceReports = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can send attendance reports' });
    }

    const { batchId } = req.body;

    // Validate input
    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required' });
    }

    // Get students in the batch
    const students = await User.findAll({
      where: { type: 'student' },
      include: [
        {
          model: StudentDetails,
          where: { batchId },
          required: true
        }
      ]
    });

    // If no students found
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in this batch' });
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Process each student
    const emailPromises = students.map(async (student) => {
      // Get attendance data for the student
      const attendanceData = await exports.getStudentAttendanceStats({
        user: { userId: student.userId }
      }, { json: jest.fn() });

      // Format email content
      const emailContent = `
        <h2>Attendance Report for ${student.name}</h2>
        <p>Enrollment: ${student.StudentDetails.enrollment}</p>
        <p>Current Semester: ${student.StudentDetails.currentSemester}</p>
        <h3>Subject-wise Attendance</h3>
        <table border="1" cellpadding="5">
          <tr>
            <th>Subject</th>
            <th>Present</th>
            <th>Total</th>
            <th>Percentage</th>
          </tr>
          ${attendanceData.stats.map(stat => `
            <tr>
              <td>${stat.subjectName}</td>
              <td>${stat.present}</td>
              <td>${stat.total}</td>
              <td>${stat.percentage}%</td>
            </tr>
          `).join('')}
        </table>
      `;

      // Send email
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.StudentDetails.guardianEmail,
        subject: `Attendance Report for ${student.name}`,
        html: emailContent
      });
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    res.json({ 
      message: `Attendance reports sent to ${students.length} guardians successfully`,
      count: students.length
    });
  } catch (error) {
    console.error('Error sending attendance reports:', error);
    res.status(500).json({ message: 'Failed to send attendance reports' });
  }
};
