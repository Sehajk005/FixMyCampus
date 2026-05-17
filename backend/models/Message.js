const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ticket_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  sender_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'messages',
  underscored: true,
});

module.exports = { Message };
