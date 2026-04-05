import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/db.js';

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20) NOT NULL DEFAULT 'viewer'
                      CHECK (role IN ('admin', 'analyst', 'viewer')),
        status      VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'inactive')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at  TIMESTAMPTZ
      )
    `);

    // Financial records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_records (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount      NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
        type        VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        category    VARCHAR(50) NOT NULL,
        date        DATE NOT NULL,
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at  TIMESTAMPTZ
      )
    `);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role)  WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_records_user_id  ON financial_records(user_id)   WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_records_type     ON financial_records(type)      WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category)  WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_records_date     ON financial_records(date)      WHERE deleted_at IS NULL;
    `);

    // Auto-update updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS set_users_updated_at ON users;
      CREATE TRIGGER set_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS set_records_updated_at ON financial_records;
      CREATE TRIGGER set_records_updated_at
        BEFORE UPDATE ON financial_records
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch(() => process.exit(1));
