const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(100),
  },
  entity_id: {
    type: DataTypes.CHAR(36),
  },
  meta: {
    type: DataTypes.JSON,
  },
}, {
  tableName: 'audit_logs',
  underscored: true,
  updatedAt: false, // Audit logs conceptually only have created_at
});

module.exports = { AuditLog };
