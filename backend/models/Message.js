const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Ticket } = require('./Ticket');
const { User } = require('./User');

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

// Associations (ORM-07)
Ticket.hasMany(Message, { foreignKey: 'ticket_id', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticket_id' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = { Message };
