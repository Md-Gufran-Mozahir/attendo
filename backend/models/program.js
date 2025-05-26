const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Program = sequelize.define('Program', {
  programId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  programType: {
    type: DataTypes.ENUM('UG','PG','PhD'),
    allowNull: false
  },
  programName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Program;
