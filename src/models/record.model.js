import { query } from '../config/db.js';

const RECORD_COLUMNS = `
  r.id, r.user_id, r.amount, r.type, r.category, r.date, r.notes,
  r.created_at, r.updated_at,
  u.name AS created_by_name
`;

export const RecordModel = {
  /**
   * Find record by ID (excludes soft-deleted).
   */
  async findById(id) {
    const res = await query(
      `SELECT ${RECORD_COLUMNS}
         FROM financial_records r
         JOIN users u ON u.id = r.user_id
        WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [id],
    );
    return res.rows[0] || null;
  },

  /**
   * Find all records with filters, search, and pagination.
   */
  async findAll({
    limit,
    offset,
    type,
    category,
    date_from,
    date_to,
    search,
    sort_by,
    order,
  } = {}) {
    const params = [];
    const conditions = ['r.deleted_at IS NULL'];

    if (type) {
      params.push(type);
      conditions.push(`r.type = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`r.category = $${params.length}`);
    }

    if (date_from) {
      params.push(date_from);
      conditions.push(`r.date >= $${params.length}`);
    }

    if (date_to) {
      params.push(date_to);
      conditions.push(`r.date <= $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(r.notes ILIKE $${params.length} OR r.category ILIKE $${params.length})`,
      );
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    // Validate sort column to prevent SQL injection
    const allowedSorts = ['amount', 'date', 'category', 'created_at'];
    const sortColumn = allowedSorts.includes(sort_by)
      ? `r.${sort_by}`
      : 'r.created_at';
    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countRes = await query(
      `SELECT COUNT(*) FROM financial_records r ${where}`,
      params,
    );
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT ${RECORD_COLUMNS}
         FROM financial_records r
         JOIN users u ON u.id = r.user_id
        ${where}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return { rows: dataRes.rows, total };
  },

  /**
   * Create a new financial record.
   */
  async create({ user_id, amount, type, category, date, notes }) {
    const res = await query(
      `INSERT INTO financial_records (user_id, amount, type, category, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, amount, type, category, date, notes, created_at, updated_at`,
      [user_id, amount, type, category, date, notes || null],
    );
    return res.rows[0];
  },

  /**
   * Update a financial record.
   */
  async update(id, fields) {
    const allowed = ['amount', 'type', 'category', 'date', 'notes'];
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
      `UPDATE financial_records SET ${updates.join(', ')}
        WHERE id = $${params.length} AND deleted_at IS NULL
       RETURNING id, user_id, amount, type, category, date, notes, created_at, updated_at`,
      params,
    );
    return res.rows[0] || null;
  },

  /**
   * Soft delete a financial record.
   */
  async softDelete(id) {
    const res = await query(
      `UPDATE financial_records SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    return res.rowCount > 0;
  },

  // Analytics / Summary

  /**
   * Total income vs expense summary.
   */
  async getSummary({ date_from, date_to } = {}) {
    const params = [];
    const conditions = ['deleted_at IS NULL'];

    if (date_from) {
      params.push(date_from);
      conditions.push(`date >= $${params.length}`);
    }
    if (date_to) {
      params.push(date_to);
      conditions.push(`date <= $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const res = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END), 0) AS net_balance,
         COUNT(*) AS total_records
       FROM financial_records ${where}`,
      params,
    );
    return res.rows[0];
  },

  /**
   * Totals grouped by category.
   */
  async getCategoryTotals({ date_from, date_to } = {}) {
    const params = [];
    const conditions = ['deleted_at IS NULL'];

    if (date_from) {
      params.push(date_from);
      conditions.push(`date >= $${params.length}`);
    }
    if (date_to) {
      params.push(date_to);
      conditions.push(`date <= $${params.length}`);
    }

    const res = await query(
      `SELECT category, type,
              SUM(amount) AS total,
              COUNT(*)    AS count
         FROM financial_records
        WHERE ${conditions.join(' AND ')}
        GROUP BY category, type
        ORDER BY total DESC`,
      params,
    );
    return res.rows;
  },

  /**
   * Monthly trends for income and expenses.
   */
  async getMonthlyTrends({ months = 12 } = {}) {
    const res = await query(
      `SELECT
         TO_CHAR(date, 'YYYY-MM') AS month,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
       FROM financial_records
       WHERE deleted_at IS NULL
         AND date >= NOW() - INTERVAL '1 month' * $1
       GROUP BY month
       ORDER BY month ASC`,
      [months],
    );
    return res.rows;
  },

  /**
   * Weekly trends.
   */
  async getWeeklyTrends({ weeks = 12 } = {}) {
    const res = await query(
      `SELECT
         TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') AS week_start,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
       FROM financial_records
       WHERE deleted_at IS NULL
         AND date >= NOW() - INTERVAL '1 week' * $1
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [weeks],
    );
    return res.rows;
  },

  /**
   * Most recent N records.
   */
  async getRecentActivity({ limit = 10 } = {}) {
    const res = await query(
      `SELECT ${RECORD_COLUMNS}
         FROM financial_records r
         JOIN users u ON u.id = r.user_id
        WHERE r.deleted_at IS NULL
        ORDER BY r.created_at DESC
        LIMIT $1`,
      [limit],
    );
    return res.rows;
  },
};
