// debug.js
const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// Sequelize configuration
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

async function debugDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database successfully!');

    // Check if database exists (already connected, so it does)
    // List all tables in the public schema
    const tables = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
      { type: QueryTypes.SELECT }
    );
    if (tables.length === 0) {
      console.log('No tables found. Please run the Schema.sql script to create tables.');
      return;
    }
    console.log('\nTables found:');
    tables.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Check if schools table has data
    const [schoolsCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM schools',
      { type: QueryTypes.SELECT }
    );
    console.log(`\nSchools table has ${schoolsCount.count} records.`);
    if (parseInt(schoolsCount.count) === 0) {
      console.log('No schools found. Please add schools data to the database.');
    }
    console.log('\nConnection closed. Database check complete.');
  } catch (error) {
    console.error('Error connecting to or checking PostgreSQL database:', error);
  } finally {
    await sequelize.close();
  }
}

debugDatabase();