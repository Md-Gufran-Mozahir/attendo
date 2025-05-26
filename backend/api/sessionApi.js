const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const sessionRepo = require('../repositories/sessionRepository');

// All endpoints require authentication
router.use(protect);

// === Student Routes ===
// GET /api/sessions/active/student - Get active sessions for the logged-in student
router.get('/active/student', sessionRepo.getActiveSessionsForStudent);

// === Teacher Routes ===
// GET /api/sessions/teacher - Get sessions for the logged-in teacher
router.get('/teacher', sessionRepo.getTeacherSessions);

// === Admin Routes ===
// GET /api/sessions - Get all sessions with optional filters (admin only)
router.get('/', sessionRepo.getAllSessions);

// === Common Routes ===
// GET /api/sessions/:id - Get session by ID (MUST be defined after more specific routes)
router.get('/:id', sessionRepo.getSessionById);

// POST /api/sessions - Create a new session (teacher only)
router.post('/', sessionRepo.createSession);

// PUT /api/sessions/:id/close - Close a session (teacher only)
router.put('/:id/close', sessionRepo.closeSession);

// PUT /api/sessions/:id - Update session details (teacher only)
router.put('/:id', sessionRepo.updateSession);

// DELETE /api/sessions/:id - Delete a session (admin only)
router.delete('/:id', sessionRepo.deleteSession);

module.exports = router;
