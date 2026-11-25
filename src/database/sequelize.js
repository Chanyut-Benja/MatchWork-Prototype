require('dotenv').config();
const { Sequelize } = require('sequelize');

const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || (dialect === 'postgres' ? '5432' : '3306'), 10);
const database = process.env.DB_NAME || 'matchwork_db';
const username = process.env.DB_USER || (dialect === 'postgres' ? 'postgres' : 'root');
const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: dialect === 'postgres' || dialect === 'postgresql' ? 'postgres' : 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;
