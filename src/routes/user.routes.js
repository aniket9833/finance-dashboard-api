import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticate, authorize, requireRole } from '../middlewares/auth.js';
import {
  validate,
  updateUserSchema,
  updatePasswordSchema,
  userFilterSchema,
} from '../validators/index.js';
import { PERMISSIONS, ROLES } from '../config/constants.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/users
 * @desc   List all users with optional filters and pagination
 * @access Admin, Analyst
 */
router.get(
  '/',
  authorize(PERMISSIONS.VIEW_USERS),
  validate(userFilterSchema, 'query'),
  getAllUsers,
);

/**
 * @route  GET /api/users/:id
 * @desc   Get a specific user by ID
 * @access Admin, Analyst (or own profile)
 */
router.get('/:id', authorize(PERMISSIONS.VIEW_USERS), getUserById);

/**
 * @route  PATCH /api/users/:id
 * @desc   Update user name, role, or status
 * @access Admin only (role/status changes); any authenticated user for own name
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.UPDATE_USER),
  validate(updateUserSchema),
  updateUser,
);

/**
 * @route  PATCH /api/users/me/password
 * @desc   Change own password
 * @access All authenticated users
 */
router.patch('/me/password', validate(updatePasswordSchema), changePassword);

/**
 * @route  DELETE /api/users/:id
 * @desc   Soft-delete a user
 * @access Admin only
 */
router.delete('/:id', requireRole(ROLES.ADMIN), deleteUser);

export default router;
