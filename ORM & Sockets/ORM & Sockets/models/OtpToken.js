const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OtpToken = sequelize.define('OtpToken', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'otp_tokens',
  underscored: true,
});

module.exports = { OtpToken };
