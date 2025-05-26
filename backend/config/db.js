require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('DB_DIALECT:', process.env.DB_DIALECT);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'default_db_name',
  process.env.DB_USER || 'default_user',
  process.env.DB_PASSWORD || 'default_password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql', // Default to MySQL if not set
  }
);

module.exports = sequelize;