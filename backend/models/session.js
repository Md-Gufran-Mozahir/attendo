const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
  sessionId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Open','Closed'),
    defaultValue: 'Open'
  }
}, {
  timestamps: true
});

module.exports = Session;
