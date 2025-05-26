const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeacherProgram = sequelize.define('TeacherProgram', {
  teacherId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  programId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  timestamps: false
});

module.exports = TeacherProgram;
