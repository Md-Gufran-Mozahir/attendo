const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentDetails = sequelize.define('StudentDetails', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  enrollment: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  currentSemester: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  photoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  guardianName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  guardianEmail: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  guardianRelation: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = StudentDetails;
