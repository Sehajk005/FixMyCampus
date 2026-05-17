const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TicketUpdate = sequelize.define('TicketUpdate', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ticket_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  updated_by: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  old_status: {
    type: DataTypes.ENUM('submitted','verified','assigned','in_progress','resolved','closed'),
  },
  new_status: {
    type: DataTypes.ENUM('submitted','verified','assigned','in_progress','resolved','closed'),
  },
  note: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'ticket_updates',
  underscored: true,
});

module.exports = { TicketUpdate };
