import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

export const UserService = {
  async getAllUsers(filters) {
    return UserModel.findAll(filters);
  },

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async updateUser(id, fields, requestingUser) {
    // Prevent non-admins from changing roles or status
    if (requestingUser.role !== 'admin' && (fields.role || fields.status)) {
      throw new AppError('Only admins can change roles or status', 403);
    }

    // Prevent admin from accidentally demoting themselves
    if (requestingUser.id === id && fields.role && fields.role !== 'admin') {
      throw new AppError('Admins cannot change their own role', 400);
    }

    if (requestingUser.id === id && fields.status === 'inactive') {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const updated = await UserModel.update(id, fields);
    if (!updated) throw new AppError('User not found', 404);
    return updated;
  },

  async changePassword(id, { current_password, new_password }) {
    const user = await UserModel.findByEmailWithPassword(
      (await UserModel.findById(id)).email,
    );

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) throw new AppError('Current password is incorrect', 400);

    if (current_password === new_password) {
      throw new AppError(
        'New password must differ from the current password',
        400,
      );
    }

    const hashed = await bcrypt.hash(new_password, SALT_ROUNDS);
    await UserModel.updatePassword(id, hashed);
  },

  async deleteUser(id, requestingUser) {
    if (requestingUser.id === id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const deleted = await UserModel.softDelete(id);
    if (!deleted) throw new AppError('User not found', 404);
  },
};
