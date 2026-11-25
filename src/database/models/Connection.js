const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Connection = sequelize.define('Connection', {
  match_id: {
    type: DataTypes.STRING(128),
    primaryKey: true
  },
  candidate_id: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  job_id: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  is_connected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.STRING(32),
    defaultValue: 'Connected'
  },
  connected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  interview_channel: {
    type: DataTypes.STRING(64),
    defaultValue: 'Google Meet'
  },
  interview_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'connections'
});

module.exports = Connection;
