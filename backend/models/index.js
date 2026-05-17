const { sequelize } = require('../config/database');
const { User } = require('./User');
const { OtpToken } = require('./OtpToken');
const { RefreshToken } = require('./RefreshToken');
const { Ticket } = require('./Ticket');
const { Message } = require('./Message');
const { StaffSkill } = require('./StaffSkill');
const { TicketUpdate } = require('./TicketUpdate');
const { Notification } = require('./Notification');
const { Feedback } = require('./Feedback');
const { JobQueue } = require('./JobQueue');
const { AuditLog } = require('./AuditLog');

// Define associations here to avoid circular dependencies

// User & RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & StaffSkill
User.hasMany(StaffSkill, { foreignKey: 'user_id', as: 'skills' });
StaffSkill.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & Ticket
User.hasMany(Ticket, { foreignKey: 'submitter_id', as: 'submittedTickets' });
User.hasMany(Ticket, { foreignKey: 'assigned_to', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'submitter_id', as: 'submitter' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to',  as: 'assignee' });

// Ticket & TicketUpdate
Ticket.hasMany(TicketUpdate, { foreignKey: 'ticket_id', as: 'updates' });
TicketUpdate.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
TicketUpdate.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// Ticket & Message
Ticket.hasMany(Message, { foreignKey: 'ticket_id', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// User & Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Ticket & Feedback
Ticket.hasOne(Feedback, { foreignKey: 'ticket_id', as: 'feedback' });
Feedback.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// User & Feedback
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'givenFeedback' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & AuditLog (optional association as user_id might be null for system actions)
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  OtpToken,
  RefreshToken,
  Ticket,
  Message,
  StaffSkill,
  TicketUpdate,
  Notification,
  Feedback,
  JobQueue,
  AuditLog
};
