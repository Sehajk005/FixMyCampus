const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StaffSkill = sequelize.define('StaffSkill', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  skill_tag: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  current_workload: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
}, {
  tableName: 'staff_skills',
  underscored: true,
});

module.exports = { StaffSkill };
