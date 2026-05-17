const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ticket_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'feedback',
  underscored: true,
});

module.exports = { Feedback };
