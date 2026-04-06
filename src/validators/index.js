import { z } from 'zod';
import {
  ROLES,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  USER_STATUS,
} from '../config/constants.js';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&#]/,
      'Password must contain at least one special character (@$!%*?&#)',
    ),
  role: z.enum(Object.values(ROLES)).optional().default(ROLES.VIEWER),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    status: z.enum(Object.values(USER_STATUS)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&#]/,
      'Password must contain at least one special character',
    ),
});

// ─── Financial Records ────────────────────────────────────────────────────────

export const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount cannot have more than 2 decimal places'),
  type: z.enum(Object.values(TRANSACTION_TYPES), {
    errorMap: () => ({
      message: `Type must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`,
    }),
  }),
  category: z.enum(TRANSACTION_CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${TRANSACTION_CATEGORIES.join(', ')}`,
    }),
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export const updateRecordSchema = createRecordSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ─── Query Filters ────────────────────────────────────────────────────────────

export const recordFilterSchema = z
  .object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    type: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
    category: z.enum(TRANSACTION_CATEGORIES).optional(),
    date_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD')
      .optional(),
    date_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD')
      .optional(),
    search: z.string().trim().max(100).optional(),
    sort_by: z.enum(['amount', 'date', 'category', 'created_at']).optional(),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  })
  .refine(
    (data) => {
      if (data.date_from && data.date_to) {
        return new Date(data.date_from) <= new Date(data.date_to);
      }
      return true;
    },
    {
      message: 'date_from must be before or equal to date_to',
      path: ['date_from'],
    },
  );

export const userFilterSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(Object.values(USER_STATUS)).optional(),
  search: z.string().trim().max(100).optional(),
});

/**
 * Middleware factory: validate req.body against a Zod schema.
 */
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    if (source === 'query') {
      req.parsedQuery = result.data;
    } else {
      req[source] = result.data;
    }

    next();
  };
