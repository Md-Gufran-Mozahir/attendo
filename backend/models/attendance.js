const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  attendanceId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attendanceDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Present','Absent','Pending'),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(9,6),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(9,6),
    allowNull: false
  }
}, {
  indexes: [
    { unique: true, fields: ['sessionId','studentId'] }
  ],
  timestamps: true
});

module.exports = Attendance;
