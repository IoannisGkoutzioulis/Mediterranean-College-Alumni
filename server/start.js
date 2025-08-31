// start.js - A helper script to ensure proper database setup before starting server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Sequelize setup for PostgreSQL
const { Sequelize, QueryTypes } = require('sequelize');
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

// Function to find schema file regardless of case sensitivity
function findSchemaFile() {
  // Check for exact case match first
  const exactPath = path.join(__dirname, 'Schema.sql');
  if (fs.existsSync(exactPath)) {
    console.log('Found Schema.sql file');
    return exactPath;
  }
  
  // Check for lowercase variant
  const lowercasePath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(lowercasePath)) {
    console.log('Found schema.sql file (lowercase)');
    return lowercasePath;
  }
  
  // Try to find any sql file with "schema" in its name
  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.toLowerCase().includes('schema') && file.toLowerCase().endsWith('.sql')) {
      console.log(`Found schema file with different name: ${file}`);
      return path.join(__dirname, file);
    }
  }
  
  // No schema file found
  console.error('Could not find Schema.sql or any similar file');
  return null;
}

// Check if port is in use
function checkPortAvailability(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Warning: Port ${port} is already in use!`);
          console.log('Another instance of the server may already be running.');
          console.log(`You can either stop the existing server or change the PORT in .env file.`);
          resolve(false);
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(true);
      });
    
    server.listen(port);
  });
}

// Function to check database connection
async function checkDatabaseConnection() {
  console.log('Testing database connection...');
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to PostgreSQL!');
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return false;
  }
}

// Function to setup database
async function setupDatabase() {
  console.log('Setting up database...');
  const schemaPath = findSchemaFile();
  if (!schemaPath) {
    console.error('Schema SQL file not found!');
    return false;
  }
  try {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await sequelize.query(schemaSQL);
    console.log('Database schema setup successfully!');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

// Function to create essential tables
async function createEssentialTables(connection) {
  try {
    console.log('Creating essential tables manually...');
    
    // Create schools table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NULL,
        last_name VARCHAR(50) NULL,
        country VARCHAR(100) NULL,
        city VARCHAR(100) NULL,
        zipcode VARCHAR(20) NULL,
        address VARCHAR(255) NULL,
        birth_date DATE NULL,
        mobile VARCHAR(20) NULL,
        school_id INT NULL,
        role ENUM('administrative', 'registered_alumni', 'applied_alumni', 'visitor') NOT NULL DEFAULT 'visitor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    // Create notification_preferences table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id INT PRIMARY KEY,
        profile_updates BOOLEAN DEFAULT TRUE,
        event_notifications BOOLEAN DEFAULT TRUE,
        job_notifications BOOLEAN DEFAULT TRUE,
        message_notifications BOOLEAN DEFAULT TRUE
      );
    `);
    
    // Insert default schools
    try {
      await connection.query(`
        INSERT IGNORE INTO schools (name, description) VALUES
        ('School of Business', 'Business Administration, Economics, Marketing and more'),
        ('School of Computing', 'Computer Science, Software Engineering, Web Development and more'),
        ('School of Engineering', 'Mechanical Engineering, Civil Engineering, Electrical Engineering and more'),
        ('School of Education', 'Education, Teaching, Learning and more'),
        ('School of Health Sciences', 'Medicine, Nursing, Pharmacy and more');
      `);
    } catch (error) {
      console.warn('Could not insert default schools:', error.message);
    }
    
    console.log('Created essential tables successfully');
    return true;
  } catch (error) {
    console.error('Error creating essential tables:', error);
    return false;
  }
}

// Function to ensure admin user exists
async function ensureAdminUser(connection, dbName) {
  console.log('Checking for admin user...');
  try {
    // Check if admin user already exists
    const [adminUsers] = await connection.query(
      `SELECT id FROM users WHERE username = ?`,
      ['admin']
    );
    
    if (adminUsers.length === 0) {
      console.log('Admin user not found, creating...');
      
      // The password is 'admin123' - pre-hashed for consistency
      const hashedPassword = '$2b$10$XooHVMy.Mz2X7BjL8CaOe.zVqFMSISOfa4F9tHYoLKAQTkbhWLv0W';
      
      try {
        await connection.query(`
          INSERT INTO users (username, email, password, first_name, last_name, country, city, zipcode, address, birth_date, mobile, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'admin',
          'admin@medcollege.edu',
          hashedPassword,
          'Admin',
          'User',
          'Greece',
          'Athens',
          '10431',
          'Admin Address 123',
          '1990-01-01',
          '+306912345678',
          'administrative'
        ]);
        
        console.log('Admin user created successfully');
      } catch (adminError) {
        console.error('Error creating admin user with full details:', adminError.message);
        
        // Try with just the essential fields
        try {
          console.log('Trying alternative admin user creation...');
          await connection.query(`
            INSERT INTO users (username, email, password, first_name, last_name, role)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            'admin',
            'admin@medcollege.edu',
            hashedPassword,
            'Admin',
            'User',
            'administrative'
          ]);
          
          console.log('Admin user created with basic info');
        } catch (basicAdminError) {
          console.error('Failed to create admin user:', basicAdminError.message);
        }
      }
    } else {
      console.log('Admin user already exists, checking password...');
      
      // Ensure the admin password is correct (update it if needed)
      const [adminUserDetails] = await connection.query(
        `SELECT id, password FROM users WHERE username = ?`,
        ['admin']
      );
      
      // Check if we should update the password
      try {
        const isValid = await bcrypt.compare('admin123', adminUserDetails[0].password);
        if (!isValid) {
          console.log('Admin password appears to be different from default, updating it...');
          const hashedPassword = '$2b$10$XooHVMy.Mz2X7BjL8CaOe.zVqFMSISOfa4F9tHYoLKAQTkbhWLv0W';
          
          await connection.query(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, 'admin']
          );
          console.log('Admin password updated to: admin123');
        } else {
          console.log('Admin password is already set correctly');
        }
      } catch (error) {
        console.log('Could not verify admin password, updating it anyway...');
        const hashedPassword = '$2b$10$XooHVMy.Mz2X7BjL8CaOe.zVqFMSISOfa4F9tHYoLKAQTkbhWLv0W';
        
        await connection.query(
          'UPDATE users SET password = ? WHERE username = ?',
          [hashedPassword, 'admin']
        );
        console.log('Admin password forcefully updated to: admin123');
      }
    }
    
    // Create a test admin user with a fresh hash as a backup
    try {
      const newHashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.query(`
        INSERT IGNORE INTO users (username, email, password, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'admintest',
        'admintest@medcollege.edu',
        newHashedPassword,
        'Admin',
        'Test',
        'administrative'
      ]);
      
      console.log('Created additional admin test user: admintest / admin123');
    } catch (testAdminError) {
      console.warn('Note: Could not create test admin user:', testAdminError.message);
    }
    
    // Setup notification preferences for admin users
    try {
      await connection.query(`
        INSERT IGNORE INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
        SELECT id, TRUE, TRUE, TRUE, TRUE FROM users WHERE username IN ('admin', 'admintest');
      `);
      console.log('Set up notification preferences for admin users');
    } catch (error) {
      console.warn('Failed to set up notification preferences:', error.message);
    }
    
    console.log('\n-----------------------------------------');
    console.log('📊 Admin User Setup Completed! 📊');
    console.log('-----------------------------------------');
    console.log('You can now log in with:');
    console.log('1. Username: admin');
    console.log('   Password: admin123');
    console.log('OR');
    console.log('2. Username: admintest');
    console.log('   Password: admin123');
    console.log('-----------------------------------------\n');
    
  } catch (error) {
    console.error('Error checking/creating admin user:', error);
  }
}

// Function to start the server
function startServer() {
  console.log('Starting server...');
  try {
    require('./server.js');
    return true;
  } catch (error) {
    console.error('Error starting server:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n==============================================');
  console.log('Mediterranean College Alumni Portal Initializer');
  console.log('==============================================\n');
  
  // First check if the port is available
  const PORT = process.env.PORT || 5000;
  const portAvailable = await checkPortAvailability(PORT);
  
  if (!portAvailable) {
    console.log(`Cannot start server on port ${PORT}. Please fix the port conflict first.`);
    process.exit(1);
  }
  
  // Next check if we can connect to PostgreSQL
  const dbConnected = await checkDatabaseConnection();
  
  if (!dbConnected) {
    console.error('Cannot proceed without database connection. Please check your PostgreSQL setup.');
    process.exit(1);
  }
  
  // Setup database
  const dbSetup = await setupDatabase();
  
  if (!dbSetup) {
    console.error('Database setup failed. Please check the errors above.');
    process.exit(1);
  }
  
  // Start server
  const serverStarted = startServer();
  
  if (!serverStarted) {
    console.error('Server failed to start. Please check the errors above.');
    process.exit(1);
  }
}

// Run main function
main();