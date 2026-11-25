const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Tag = sequelize.define('Tag', {
  tag_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tag_name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING(64),
    defaultValue: 'technical_skill'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'tags'
});

module.exports = Tag;
