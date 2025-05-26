const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentSubject = sequelize.define('StudentSubject', {
  studentId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  subjectId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  timestamps: false
});

module.exports = StudentSubject;
