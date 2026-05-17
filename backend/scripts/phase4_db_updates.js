require('dotenv').config();
const { sequelize } = require('../config/database');

async function runUpdates() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database. Running Phase 4 updates...');

    // 1. Alter staff_skills
    const [skillsResults] = await sequelize.query(`SHOW COLUMNS FROM staff_skills LIKE 'skill_tag'`);
    if (skillsResults.length === 0) {
      console.log('Updating staff_skills table...');
      await sequelize.query(`ALTER TABLE staff_skills CHANGE skill skill_tag VARCHAR(100) NOT NULL;`);
      await sequelize.query(`ALTER TABLE staff_skills ADD COLUMN availability TINYINT(1) DEFAULT 1;`);
      await sequelize.query(`ALTER TABLE staff_skills ADD COLUMN current_workload INT DEFAULT 0;`);
      await sequelize.query(`ALTER TABLE staff_skills ADD COLUMN max_capacity INT DEFAULT 5;`);
    } else {
      console.log('staff_skills already updated.');
    }

    // 2. Alter notifications
    const [notifResults] = await sequelize.query(`SHOW COLUMNS FROM notifications LIKE 'message'`);
    if (notifResults.length === 0) {
      console.log('Updating notifications table...');
      await sequelize.query(`ALTER TABLE notifications CHANGE body message TEXT;`);
      await sequelize.query(`ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'system';`);
    } else {
      console.log('notifications already updated.');
    }

    console.log('🎉 Phase 4 DB updates completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

runUpdates();
