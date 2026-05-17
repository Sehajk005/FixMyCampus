const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobQueue = sequelize.define('JobQueue', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  job_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending','processing','done','failed'),
    defaultValue: 'pending',
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  run_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'job_queue',
  underscored: true,
});

module.exports = { JobQueue };
