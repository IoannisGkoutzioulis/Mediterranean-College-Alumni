const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function fixAdmin() {
  try {
    console.log('Starting admin fix with VERIFIED password hash...');

    const password = 'admin123';
    const saltRounds = 10;

    // Step 1: Generate fresh hash
    const freshHash = await bcrypt.hash(password, saltRounds);
    console.log('Generated hash:', freshHash);

    // Step 2: VERIFY the hash before using it
    const verifyResult = await bcrypt.compare(password, freshHash);
    console.log('Verification check:', verifyResult ? 'PASSED ✓' : 'FAILED ✗');

    if (!verifyResult) {
      console.log('ERROR: Hash verification failed! Cannot continue.');
      await sequelize.close();
      return;
    }

    // Step 3: Remove existing admin
    await sequelize.query(
      'DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username = :username)',
      { replacements: { username: 'admin' }, type: QueryTypes.DELETE }
    );
    await sequelize.query(
      'DELETE FROM users WHERE username = :username',
      { replacements: { username: 'admin' }, type: QueryTypes.DELETE }
    );
    console.log('Removed existing admin');

    // Step 4: Create admin with VERIFIED hash
    const [result] = await sequelize.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role)
       VALUES (:username, :email, :password, :first_name, :last_name, :role)
       RETURNING id`,
      {
        replacements: {
          username: 'admin',
          email: 'admin@medcollege.edu',
          password: freshHash,
          first_name: 'Admin',
          last_name: 'User',
          role: 'administrative',
        },
        type: QueryTypes.INSERT,
      }
    );
    const adminId = result[0]?.id || result[0];
    console.log('Created admin user with ID:', adminId);

    // Add notification preferences
    if (adminId) {
      await sequelize.query(
        `INSERT INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
         VALUES (:user_id, TRUE, TRUE, TRUE, TRUE)`,
        { replacements: { user_id: adminId }, type: QueryTypes.INSERT }
      );
      console.log('Added notification preferences');
    }

    await sequelize.close();

    console.log('\n-----------------------------------------');
    console.log('Admin user fixed and reset!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('-----------------------------------------\n');
  } catch (error) {
    console.error('Error fixing admin user:', error);
    await sequelize.close();
  }
}

fixAdmin();