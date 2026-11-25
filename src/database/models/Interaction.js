const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Interaction = sequelize.define('Interaction', {
  interaction_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
  initiator_role: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  is_matched: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  candidate_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  job_data: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'interactions'
});

module.exports = Interaction;
