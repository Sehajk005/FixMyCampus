require('dotenv').config();
const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Make password_hash nullable
    try {
      await sequelize.query(`
        ALTER TABLE users MODIFY COLUMN password_hash TEXT NULL;
      `);
      console.log('✅ password_hash made nullable.');
    } catch (err) {
      console.log('ℹ️  password_hash already nullable or error:', err.message);
    }

    // Add google_uid column
    try {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN google_uid VARCHAR(128) NULL AFTER avatar_url;
      `);
      console.log('✅ google_uid column added.');
    } catch (err) {
      if (err.message.includes('Duplicate column name')) {
        console.log('ℹ️  google_uid already exists.');
      } else {
        throw err;
      }
    }

    // Add unique index on google_uid
    try {
      await sequelize.query(`
        ALTER TABLE users ADD UNIQUE KEY idx_google_uid (google_uid);
      `);
      console.log('✅ Unique index on google_uid added.');
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log('ℹ️  idx_google_uid index already exists.');
      } else {
        throw err;
      }
    }

    // Add status column (may already exist from migrate_phase5.js)
    try {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER google_uid;
      `);
      console.log('✅ status column added.');
    } catch (err) {
      if (err.message.includes('Duplicate column name')) {
        console.log('ℹ️  status column already exists.');
      } else {
        throw err;
      }
    }

    console.log('\nMigration complete.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
