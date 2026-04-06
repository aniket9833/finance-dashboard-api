import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash('Password@123', 12);

    // Seed users
    const usersResult = await client.query(
      `
      INSERT INTO users (name, email, password, role, status) VALUES
        ('Aniket Ingole',   'admin@finance.com',   $1, 'admin',   'active'),
        ('Vinay Kolhe',  'analyst@finance.com',  $1, 'analyst', 'active'),
        ('Sameer Thapa',    'viewer@finance.com',   $1, 'viewer',  'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `,
      [hashedPassword],
    );

    console.log(`Seeded ${usersResult.rowCount} users`);

    // Get admin user id for record ownership
    const adminResult = await client.query(
      `SELECT id FROM users WHERE email = 'admin@finance.com' LIMIT 1`,
    );
    const adminId = adminResult.rows[0]?.id;

    if (adminId) {
      await client.query(
        `
        INSERT INTO financial_records (user_id, amount, type, category, date, notes) VALUES
          ($1, 85000.00, 'income',  'salary',        '2025-01-01', 'January salary'),
          ($1, 12000.00, 'income',  'freelance',     '2025-01-15', 'Freelance project payment'),
          ($1,  3200.00, 'expense', 'food',           '2025-01-10', 'Groceries and dining'),
          ($1,  1500.00, 'expense', 'transport',      '2025-01-12', 'Monthly commute and fuel'),
          ($1,  8500.00, 'expense', 'utilities',      '2025-01-20', 'Electricity, internet, phone'),
          ($1, 90000.00, 'income',  'salary',         '2025-02-01', 'February salary'),
          ($1,  4100.00, 'expense', 'healthcare',     '2025-02-05', 'Health insurance premium'),
          ($1,  2200.00, 'expense', 'entertainment',  '2025-02-14', 'Valentine month activities'),
          ($1, 15000.00, 'income',  'investment',     '2025-02-28', 'Dividend income'),
          ($1,  6000.00, 'expense', 'education',      '2025-03-01', 'Online courses'),
          ($1, 90000.00, 'income',  'salary',         '2025-03-01', 'March salary'),
          ($1,  9000.00, 'expense', 'shopping',       '2025-03-15', 'Clothing and electronics'),
          ($1, 25000.00, 'income',  'bonus',          '2025-03-31', 'Q1 performance bonus')
        ON CONFLICT DO NOTHING
      `,
        [adminId],
      );

      console.log('Seeded financial records');
    }

    await client.query('COMMIT');
    console.log('\nSeed completed!');
    console.log('Login credentials:');
    console.log('Admin: admin@finance.com   / Password@123');
    console.log('Analyst: analyst@finance.com / Password@123');
    console.log('Viewer: viewer@finance.com  / Password@123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(() => process.exit(1));
