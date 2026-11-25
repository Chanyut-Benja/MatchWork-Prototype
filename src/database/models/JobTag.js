const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const JobTag = sequelize.define('JobTag', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  job_id: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.50
  }
}, {
  tableName: 'job_tags'
});

module.exports = JobTag;
