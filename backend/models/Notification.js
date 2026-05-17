const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'system',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  underscored: true,
});

module.exports = { Notification };
