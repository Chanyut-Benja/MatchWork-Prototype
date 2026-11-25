const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const JobPosting = sequelize.define('JobPosting', {
  job_id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  company_name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  company_logo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  experience_years_requirement: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  min_salary: {
    type: DataTypes.INTEGER,
    defaultValue: 40000
  },
  max_salary: {
    type: DataTypes.INTEGER,
    defaultValue: 80000
  },
  location: {
    type: DataTypes.STRING(128),
    defaultValue: 'Bangkok'
  },
  work_style: {
    type: DataTypes.STRING(32),
    defaultValue: 'hybrid'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(32),
    defaultValue: 'active'
  }
}, {
  tableName: 'job_postings'
});

module.exports = JobPosting;
