const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');
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

/**
 * This script specifically creates or updates the admin user
 * It's useful if you just need to fix the admin login without
 * running the full database setup.
 */
async function createAdminUser() {
  try {
    console.log('\n==============================================');
    console.log('Mediterranean College Admin User Creator');
    console.log('==============================================\n');

    // The pre-hashed password for 'admin123'
    const hashedPassword = '$2b$10$XooHVMy.Mz2X7BjL8CaOe.zVqFMSISOfa4F9tHYoLKAQTkbhWLv0W';

    // Check if admin user already exists
    const [users] = await sequelize.query(
      'SELECT * FROM users WHERE username = :username',
      { replacements: { username: 'admin' }, type: QueryTypes.SELECT }
    );

    if (users.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await sequelize.query(
        'UPDATE users SET password = :password WHERE username = :username',
        { replacements: { password: hashedPassword, username: 'admin' }, type: QueryTypes.UPDATE }
      );
      console.log('Admin password updated successfully!');
    } else {
      console.log('Creating new admin user...');
      await sequelize.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role)
         VALUES (:username, :email, :password, :first_name, :last_name, :role)` ,
        {
          replacements: {
            username: 'admin',
            email: 'admin@medcollege.edu',
            password: hashedPassword,
            first_name: 'Admin',
            last_name: 'User',
            role: 'administrative',
          },
          type: QueryTypes.INSERT,
        }
      );
      console.log('Admin user created successfully!');
    }

    // Create a second admin (with freshly hashed password) as a backup
    try {
      const freshHashedPassword = await bcrypt.hash('admin123', 10);
      const [existingTestAdmin] = await sequelize.query(
        'SELECT * FROM users WHERE username = :username',
        { replacements: { username: 'admintest' }, type: QueryTypes.SELECT }
      );
      if (existingTestAdmin.length > 0) {
        await sequelize.query(
          'UPDATE users SET password = :password WHERE username = :username',
          { replacements: { password: freshHashedPassword, username: 'admintest' }, type: QueryTypes.UPDATE }
        );
        console.log('Admintest user password updated!');
      } else {
        await sequelize.query(
          `INSERT INTO users (username, email, password, first_name, last_name, role)
           VALUES (:username, :email, :password, :first_name, :last_name, :role)` ,
          {
            replacements: {
              username: 'admintest',
              email: 'admintest@medcollege.edu',
              password: freshHashedPassword,
              first_name: 'Admin',
              last_name: 'Test',
              role: 'administrative',
            },
            type: QueryTypes.INSERT,
          }
        );
        console.log('Admintest user created as backup!');
      }
    } catch (error) {
      console.log('Could not create/update backup admin user:', error.message);
    }

    // Create notification preferences for admin users
    try {
      const [adminUsers] = await sequelize.query(
        'SELECT id FROM users WHERE username IN (:admin, :admintest)',
        { replacements: { admin: 'admin', admintest: 'admintest' }, type: QueryTypes.SELECT }
      );
      for (const adminUser of adminUsers) {
        await sequelize.query(
          `INSERT INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
           VALUES (:user_id, TRUE, TRUE, TRUE, TRUE)
           ON CONFLICT (user_id) DO NOTHING`,
          { replacements: { user_id: adminUser.id }, type: QueryTypes.INSERT }
        );
      }
      console.log('Set up notification preferences for admin users');
    } catch (error) {
      console.warn('Could not create notification preferences:', error.message);
    }

    await sequelize.close();

    console.log('\n-----------------------------------------');
    console.log('🔑 Admin User Setup Completed! 🔑');
    console.log('-----------------------------------------');
    console.log('You can now log in with either:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('OR');
    console.log('Username: admintest');
    console.log('Password: admin123');
    console.log('-----------------------------------------\n');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

createAdminUser();