require('dotenv').config();
const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Add status column
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';
    `);

    console.log('Migration successful: Added status to users.');
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column name')) {
        console.log('Status column already exists.');
    } else {
        console.error('Unable to run migration:', error);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();
