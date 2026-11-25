const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  connectionId: {
    type: DataTypes.STRING(128),
    allowNull: false,
    field: 'connection_id'
  },
  senderId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'sender_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'messages',
  updatedAt: false
});

module.exports = Message;
