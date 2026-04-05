export const ROLES = Object.freeze({
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
});

export const PERMISSIONS = Object.freeze({
  // User management
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',

  // Financial records
  CREATE_RECORD: 'create_record',
  UPDATE_RECORD: 'update_record',
  DELETE_RECORD: 'delete_record',
  VIEW_RECORDS: 'view_records',

  // Dashboard & analytics
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.VIEWER]: [PERMISSIONS.VIEW_RECORDS, PERMISSIONS.VIEW_DASHBOARD],
});

export const TRANSACTION_TYPES = Object.freeze({
  INCOME: 'income',
  EXPENSE: 'expense',
});

export const TRANSACTION_CATEGORIES = Object.freeze([
  'salary',
  'investment',
  'freelance',
  'rental',
  'bonus',
  'refund',
  'food',
  'transport',
  'utilities',
  'healthcare',
  'entertainment',
  'education',
  'shopping',
  'insurance',
  'taxes',
  'other',
]);

export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});
