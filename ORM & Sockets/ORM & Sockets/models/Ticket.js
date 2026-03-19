const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');

const Ticket = sequelize.define('Ticket', {
  id:           { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  title:        { type: DataTypes.STRING(200), allowNull: false },
  description:  { type: DataTypes.TEXT, allowNull: false },
  category:     { type: DataTypes.ENUM('electrical','wifi','plumbing','cleanliness','furniture','ac_hvac','security','other'), allowNull: false },
  location:     { type: DataTypes.STRING(200), allowNull: false },
  status:       { type: DataTypes.ENUM('submitted','verified','assigned','in_progress','resolved','closed'), defaultValue: 'submitted' },
  priority:     { type: DataTypes.ENUM('low','medium','high','critical'), defaultValue: 'medium' },
  submitter_id: { type: DataTypes.CHAR(36), allowNull: false },
  assigned_to:  { type: DataTypes.CHAR(36), allowNull: true },
}, {
  tableName: 'tickets',
  underscored: true,
});

User.hasMany(Ticket,  { foreignKey: 'submitter_id', as: 'submittedTickets' });
Ticket.belongsTo(User, { foreignKey: 'submitter_id', as: 'submitter' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to',  as: 'assignee' });

module.exports = { Ticket };