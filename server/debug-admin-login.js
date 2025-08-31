const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function debugAdminLogin() {
  try {
    console.log('==========================================');
    console.log('COMPREHENSIVE ADMIN LOGIN DEBUGGING SCRIPT');
    console.log('==========================================\n');

    // Check connection
    await sequelize.authenticate();
    console.log('✅ Successfully connected to database');

    // Known hash for 'admin123'
    const knownHash = '$2b$10$XooHVMy.Mz2X7BjL8CaOe.zVqFMSISOfa4F9tHYoLKAQTkbhWLv0W';

    // Delete existing admin user and related records
    try {
      await sequelize.query(
        'DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username = :username)',
        { replacements: { username: 'admin' }, type: QueryTypes.DELETE }
      );
      await sequelize.query(
        'DELETE FROM users WHERE username = :username',
        { replacements: { username: 'admin' }, type: QueryTypes.DELETE }
      );
      console.log('✅ Cleaned up existing admin user');
    } catch (err) {
      console.log('⚠️ Error cleaning up existing admin:', err.message);
    }

    // Create new admin user with known hash
    console.log('\nCreating admin user with known hash for "admin123"');
    const [insertResult] = await sequelize.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role)
       VALUES (:username, :email, :password, :first_name, :last_name, :role)
       RETURNING id`,
      {
        replacements: {
          username: 'admin',
          email: 'admin@medcollege.edu',
          password: knownHash,
          first_name: 'Admin',
          last_name: 'User',
          role: 'administrative',
        },
        type: QueryTypes.INSERT,
      }
    );
    const adminId = insertResult[0]?.id || insertResult[0];
    console.log('✅ Created admin user with known hash');

    // Add notification preferences
    if (adminId) {
      await sequelize.query(
        `INSERT INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
         VALUES (:user_id, TRUE, TRUE, TRUE, TRUE)`,
        { replacements: { user_id: adminId }, type: QueryTypes.INSERT }
      );
      console.log('✅ Added notification preferences');
    }

    // Test login by fetching user and comparing password
    const [users] = await sequelize.query(
      'SELECT * FROM users WHERE username = :username',
      { replacements: { username: 'admin' }, type: QueryTypes.SELECT }
    );
    if (users.length === 0) {
      console.log('❌ Admin user not found after creation!');
    } else {
      const user = users[0];
      const validPassword = await bcrypt.compare('admin123', user.password);
      console.log('Password check:', validPassword ? '✅ SUCCESS' : '❌ FAILURE');
    }

    await sequelize.close();
    console.log('\n------------------------------------------');
    console.log('Admin login debug complete!');
    console.log('------------------------------------------\n');
  } catch (error) {
    console.error('Error in admin login debug:', error);
    await sequelize.close();
  }
}

debugAdminLogin();