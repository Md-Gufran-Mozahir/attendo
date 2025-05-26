require('dotenv').config({ path: './backend/.env' }); // 1. Load .env first

console.log('Environment Variables:', process.env);

const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/db');
const { createDefaultAdmin } = require('./repositories/userRepository');
const bodyParser = require('body-parser');

const app = express();

// 2. Built‑in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175','http://localhost:5176','http://localhost:5177'], // Allow from multiple origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Load models & associations
require('./models');

// 4. Import APIs
const authApi       = require('./api/authApi');
const userApi       = require('./api/userApi');
const studentApi    = require('./api/studentApi');
const programApi    = require('./api/programApi');
const subjectApi    = require('./api/subjectApi');
const sessionApi    = require('./api/sessionApi');
const attendanceApi = require('./api/attendanceApi');
const locationApi   = require('./api/locationApi');
const batchApi      = require('./api/batchApi');
const departmentApi = require('./api/departmentApi');
const studentSubjectApi = require('./api/studentSubjectApi');
const teacherProgramApi = require('./api/teacherProgramApi');

// 5. Mount APIs
app.use('/api/auth',       authApi);
app.use('/api/users',      userApi);
app.use('/api/students',   studentApi);
app.use('/api/programs',   programApi);
app.use('/api/subjects',   subjectApi);
app.use('/api/sessions',   sessionApi);
app.use('/api/attendance', attendanceApi);
app.use('/api/locations',  locationApi);
app.use('/api/batches',    batchApi);
app.use('/api/departments', departmentApi);
app.use('/api/student-subjects', studentSubjectApi);
app.use('/api/teacher-programs', teacherProgramApi);

// 6. 404 Fallback
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// 7. Sync DB & Start
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: false })
  .then(async () => {
    console.log('Database connected successfully.');
    
    // Create default admin if needed
    try {
      await createDefaultAdmin();
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
    
    app.listen(PORT, () => console.log(`Server @ http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
  });

module.exports = app;
