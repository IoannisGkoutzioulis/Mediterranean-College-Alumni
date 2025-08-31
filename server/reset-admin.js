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

async function resetAdmin() {
  try {
    console.log('Starting admin user reset...');

    // Generate a fresh hash
    const freshHashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated fresh password hash');

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
      console.log('Deleted existing admin user');
    } catch (err) {
      console.log('Error cleaning up existing admin (may not exist):', err.message);
    }

    // Create new admin user
    const [insertResult] = await sequelize.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role)
       VALUES (:username, :email, :password, :first_name, :last_name, :role)
       RETURNING id`,
      {
        replacements: {
          username: 'admin',
          email: 'admin@medcollege.edu',
          password: freshHashedPassword,
          first_name: 'Admin',
          last_name: 'User',
          role: 'administrative',
        },
        type: QueryTypes.INSERT,
      }
    );
    const adminId = insertResult[0]?.id || insertResult[0];
    console.log('Created admin user with fresh password hash');

    // Add notification preferences
    if (adminId) {
      await sequelize.query(
        `INSERT INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
         VALUES (:user_id, TRUE, TRUE, TRUE, TRUE)`,
        { replacements: { user_id: adminId }, type: QueryTypes.INSERT }
      );
      console.log('Added notification preferences');
    }

    console.log('\n-----------------------------------------');
    console.log('🔑 Admin Reset Completed! 🔑');
    console.log('-----------------------------------------');
    console.log('You can now log in with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('-----------------------------------------\n');
  } catch (error) {
    console.error('Error resetting admin user:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
resetAdmin();