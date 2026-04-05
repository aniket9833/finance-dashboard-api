import { query, transaction } from '../config/db.js';

const SAFE_COLUMNS = 'id, name, email, role, status, created_at, updated_at';

export const UserModel = {
  /**
   * Find user by ID (excludes soft-deleted).
   */
  async findById(id) {
    const res = await query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return res.rows[0] || null;
  },

  /**
   * Find user by email including password (for auth).
   */
  async findByEmailWithPassword(email) {
    const res = await query(
      `SELECT id, name, email, password, role, status
         FROM users
        WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return res.rows[0] || null;
  },

  /**
   * Find all users with optional filters and pagination.
   */
  async findAll({ limit, offset, role, status, search } = {}) {
    const params = [];
    const conditions = ['deleted_at IS NULL'];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${params.length} OR email ILIKE $${params.length})`,
      );
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT ${SAFE_COLUMNS}
         FROM users
        ${where}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return { rows: dataRes.rows, total };
  },

  /**
   * Create a new user.
   */
  async create({ name, email, password, role, status }) {
    const res = await query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SAFE_COLUMNS}`,
      [name, email, password, role, status],
    );
    return res.rows[0];
  },

  /**
   * Update user fields.
   */
  async update(id, fields) {
    const allowed = ['name', 'role', 'status'];
    const updates = [];
    const params = [];

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key) && val !== undefined) {
        params.push(val);
        updates.push(`${key} = $${params.length}`);
      }
    }

    if (!updates.length) return null;

    params.push(id);
    const res = await query(
      `UPDATE users SET ${updates.join(', ')}
        WHERE id = $${params.length} AND deleted_at IS NULL
       RETURNING ${SAFE_COLUMNS}`,
      params,
    );
    return res.rows[0] || null;
  },

  /**
   * Update password hash.
   */
  async updatePassword(id, hashedPassword) {
    await query(
      `UPDATE users SET password = $1 WHERE id = $2 AND deleted_at IS NULL`,
      [hashedPassword, id],
    );
  },

  /**
   * Soft delete a user.
   */
  async softDelete(id) {
    const res = await query(
      `UPDATE users SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    return res.rowCount > 0;
  },

  /**
   * Check if email is taken (excluding a user ID).
   */
  async emailExists(email, excludeId = null) {
    const params = [email];
    let sql = `SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL`;
    if (excludeId) {
      params.push(excludeId);
      sql += ` AND id != $2`;
    }
    const res = await query(sql, params);
    return res.rowCount > 0;
  },
};
