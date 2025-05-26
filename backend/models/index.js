const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db');

const db = {};

// Dynamically import all models
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file)); // Import the model directly
    db[model.name] = model; // Add the model to the db object
  });

console.log('Loaded models:', Object.keys(db));

// Extract models from db object
const {
  User,
  StudentDetails,
  Program,
  Subject,
  TeacherProgram,
  StudentSubject,
  UniversityLocation,
  Session,
  Attendance,
  Batch,
} = db;

// Define associations
User.hasOne(StudentDetails, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentDetails.belongsTo(User, { foreignKey: 'userId' });

Program.hasMany(Subject, { foreignKey: 'programId' });
Subject.belongsTo(Program, { foreignKey: 'programId' });

// Add the teacher association
Subject.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
User.hasMany(Subject, { as: 'teachingSubjects', foreignKey: 'teacherId' });

User.belongsToMany(Program, { through: TeacherProgram, foreignKey: 'teacherId' });
Program.belongsToMany(User, { through: TeacherProgram, foreignKey: 'programId' });

User.belongsToMany(Subject, { through: StudentSubject, foreignKey: 'studentId', onDelete: 'CASCADE' });
Subject.belongsToMany(User, { through: StudentSubject, foreignKey: 'subjectId' });

// Add many-to-many relationship between Batch and Program
Program.belongsToMany(Batch, { through: 'ProgramBatch', foreignKey: 'programId' });
Batch.belongsToMany(Program, { through: 'ProgramBatch', foreignKey: 'batchId' });

Session.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Session.belongsTo(Program, { foreignKey: 'programId' });
Session.belongsTo(Subject, { foreignKey: 'subjectId' });
Session.belongsTo(Batch, { foreignKey: 'batchId' });
Session.belongsTo(UniversityLocation, { foreignKey: 'locationId' });

Attendance.belongsTo(Session, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { as: 'student', foreignKey: 'studentId', onDelete: 'CASCADE' });

// Export models and sequelize instance
db.sequelize = sequelize;
db.Sequelize = require('sequelize');

module.exports = db;