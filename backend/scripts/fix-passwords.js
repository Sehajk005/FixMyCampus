/**
 * Fix My Campus — Password Fixer Script
 * Run this ONCE after running seed.sql to properly hash all passwords.
 * Usage: node scripts/fix-passwords.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../models/User');

async function fixPasswords() {
  try {
    await sequelize.authenticate();
    console.log('✅  Connected to database');

    const users = await User.findAll();
    let fixed = 0;

    for (const user of users) {
      // Only fix if not already a bcrypt hash (bcrypt hashes start with $2)
      if (!user.password_hash.startsWith('$2')) {
        const hashed = await bcrypt.hash(user.password_hash, 12);
        await User.update(
          { password_hash: hashed },
          { where: { id: user.id }, hooks: false } // skip beforeCreate hook
        );
        console.log(`  🔐  Hashed password for: ${user.email}`);
        fixed++;
      } else {
        console.log(`  ✓   Already hashed: ${user.email}`);
      }
    }

    console.log(`\n✅  Done! Fixed ${fixed} password(s).`);
    console.log('You can now login with password: Test@1234');
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

fixPasswords();
