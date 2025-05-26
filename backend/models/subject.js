const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subject = sequelize.define('Subject', {
  subjectId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  subjectCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  subjectName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  semester: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Subject;
