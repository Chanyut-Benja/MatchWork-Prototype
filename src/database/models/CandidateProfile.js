const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const CandidateProfile = sequelize.define('CandidateProfile', {
  candidate_id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING(128),
    defaultValue: 'Bangkok, Thailand'
  },
  expected_salary: {
    type: DataTypes.INTEGER,
    defaultValue: 50000
  },
  work_style: {
    type: DataTypes.STRING(32),
    defaultValue: 'hybrid'
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  portfolio_url: {
    type: DataTypes.STRING(512),
    allowNull: true
  },
  github_url: {
    type: DataTypes.STRING(512),
    allowNull: true
  },
  linkedin_url: {
    type: DataTypes.STRING(512),
    allowNull: true
  },
  resume_filename: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resume_data: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  online_resume: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'candidate_profiles'
});

module.exports = CandidateProfile;
