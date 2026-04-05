import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { sendError } from '../utils/response.js';
import { ROLE_PERMISSIONS, USER_STATUS } from '../config/constants.js';

/**
 * Verify JWT and attach user to req.user.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      `SELECT id, name, email, role, status
         FROM users
        WHERE id = $1 AND deleted_at IS NULL`,
      [decoded.id],
    );

    if (!result.rows.length) {
      return sendError(res, 'User not found or has been deleted', 401);
    }

    const user = result.rows[0];

    if (user.status === USER_STATUS.INACTIVE) {
      return sendError(
        res,
        'Your account has been deactivated. Contact an administrator.',
        403,
      );
    }

    req.user = {
      ...user,
      permissions: ROLE_PERMISSIONS[user.role] || [],
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Authentication token has expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid authentication token', 401);
    }
    next(err);
  }
};

/**
 * Check that the authenticated user has a required permission.
 */
export const authorize =
  (...permissions) =>
  (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const hasPermission = permissions.every((p) =>
      req.user.permissions.includes(p),
    );

    if (!hasPermission) {
      return sendError(
        res,
        `Access denied. Required permission(s): ${permissions.join(', ')}`,
        403,
      );
    }

    next();
  };

/**
 * Restrict access to specific roles.
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403,
      );
    }

    next();
  };
