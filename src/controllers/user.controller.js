import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../utils/errors.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPagination,
} from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const query = req.parsedQuery || req.query;
  const { page, limit, offset } = parsePagination(query);
  const { role, status, search } = query;

  const { rows, total } = await UserService.getAllUsers({
    limit,
    offset,
    role,
    status,
    search,
  });

  sendPaginated(res, rows, buildPagination(page, limit, total));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  sendSuccess(res, { user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await UserService.updateUser(req.params.id, req.body, req.user);
  sendSuccess(res, { user }, 'User updated successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  await UserService.changePassword(req.user.id, req.body);
  sendSuccess(res, null, 'Password changed successfully');
});

export const deleteUser = asyncHandler(async (req, res) => {
  await UserService.deleteUser(req.params.id, req.user);
  sendSuccess(res, null, 'User deleted successfully');
});
