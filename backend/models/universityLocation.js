const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UniversityLocation = sequelize.define('UniversityLocation', {
  locationId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  campusName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  centerLatitude: {
    type: DataTypes.DECIMAL(9,6),
    allowNull: false
  },
  centerLongitude: {
    type: DataTypes.DECIMAL(9,6),
    allowNull: false
  },
  radius: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = UniversityLocation;
