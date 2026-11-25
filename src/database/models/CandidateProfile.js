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
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'candidate_profiles'
});

module.exports = CandidateProfile;
