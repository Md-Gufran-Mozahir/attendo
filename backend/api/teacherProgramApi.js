const express = require('express');
const router = express.Router();
const teacherProgramRoutes = require('../routes/teacherProgramRoutes');

// Mount teacher-program routes
router.use('/', teacherProgramRoutes);

module.exports = router; 