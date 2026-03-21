const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'refresh_tokens',
  underscored: true,
});

module.exports = { RefreshToken };
