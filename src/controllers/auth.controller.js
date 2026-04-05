import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/errors.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { ROLES } from '../config/constants.js';

export const register = asyncHandler(async (req, res) => {
  // Self-registration always yields 'viewer'; only admins can assign higher roles
  const role = req.user?.role === 'admin' ? req.body.role : ROLES.VIEWER;
  const { user, token } = await AuthService.register({ ...req.body, role });
  sendCreated(res, { user, token }, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.login(req.body);
  sendSuccess(res, { user, token }, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const { password: _, ...user } = req.user;
  sendSuccess(res, { user });
});
