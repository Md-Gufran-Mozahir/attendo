const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const attendanceRepo = require('../repositories/attendanceRepository');

// All endpoints require authentication
router.use(protect);

// === Student Routes ===
// POST /api/attendance/mark - Mark attendance for a session with geolocation
router.post('/mark', attendanceRepo.markAttendance);

// POST /api/attendance/mark/:sessionId - Alternative endpoint for marking attendance
router.post('/mark/:sessionId', (req, res) => {
  req.body.sessionId = req.params.sessionId;
  attendanceRepo.markAttendance(req, res);
});

// GET /api/attendance/student/history - Get attendance history for the logged-in student
router.get('/student/history', attendanceRepo.getStudentAttendanceHistory);

// GET /api/attendance/student/stats - Get attendance statistics for the logged-in student
router.get('/student/stats', attendanceRepo.getStudentAttendanceStats);

// === Teacher Routes ===
// GET /api/attendance/session/:sessionId - Get all attendance records for a specific session
router.get('/session/:sessionId', attendanceRepo.getSessionAttendance);

// PUT /api/attendance/session/:sessionId/verify-all - Verify all pending attendance records for a session
router.put('/session/:sessionId/verify-all', attendanceRepo.verifyAllAttendance);

// GET /api/attendance/teacher/report - Get attendance report for teacher's subjects
router.get('/teacher/report', attendanceRepo.getTeacherAttendanceReport);

// GET /api/attendance/teacher/summary - Get attendance summary for a teacher's subjects
router.get('/teacher/summary', attendanceRepo.getTeacherAttendanceSummary);

// === Admin Routes ===
// GET /api/attendance/admin/report - Get attendance report across programs/batches
router.get('/admin/report', attendanceRepo.getOverallAttendanceReport);

// POST /api/attendance/admin/send-reports - Send attendance reports to guardians
router.post('/admin/send-reports', attendanceRepo.sendAttendanceReports);

// GET /api/attendance - Get all attendance records (with optional filters)
router.get('/', attendanceRepo.getAllAttendances);

// POST /api/attendance - Create attendance record (admin only)
router.post('/', attendanceRepo.createAttendance);

// === Parameterized Routes (MUST come after specific routes) ===
// PUT /api/attendance/:id - Update attendance status (present, absent, pending)
router.put('/:id', attendanceRepo.updateAttendanceStatus);

// GET /api/attendance/:id - Get attendance by ID
router.get('/:id', attendanceRepo.getAttendanceById);

// DELETE /api/attendance/:id - Delete attendance record (admin only)
router.delete('/:id', attendanceRepo.deleteAttendance);

module.exports = router;
