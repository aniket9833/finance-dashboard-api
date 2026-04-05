import { PAGINATION } from '../config/constants.js';

/**
 * Parse and normalize pagination params from query string.
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build ORDER BY clause safely.
 * allowedColumns: array of column names permitted for sorting.
 */
export const buildOrderBy = (
  query,
  allowedColumns,
  defaultColumn = 'created_at',
) => {
  const column = allowedColumns.includes(query.sort_by)
    ? query.sort_by
    : defaultColumn;
  const direction = query.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return `${column} ${direction}`;
};
