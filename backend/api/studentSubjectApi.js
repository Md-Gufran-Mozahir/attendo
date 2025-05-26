const express = require('express');
const router = express.Router();
const studentSubjectRoutes = require('../routes/studentSubjectRoutes');

// Mount student-subject routes
router.use('/', studentSubjectRoutes);

module.exports = router; 