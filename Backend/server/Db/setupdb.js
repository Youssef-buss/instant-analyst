import pool from "./pool.js";

const createTables = async () => {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Users table created");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS datasets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        file_name VARCHAR(255),
        file_path TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Datasets table created");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES datasets(id),
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Results table created");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        file_name TEXT,
        insights JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Reports table created");

  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    await pool.end();
  }
};

createTables();