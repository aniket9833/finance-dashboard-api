import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/errors.js';
import { ROLES, USER_STATUS } from '../config/constants.js';

const SALT_ROUNDS = 12;

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

export const AuthService = {
  async register({ name, email, password, role }) {
    const exists = await UserModel.emailExists(email);
    if (exists) throw new AppError('Email address is already registered', 409);

    // Only admins can create non-viewer accounts — enforced at controller level,
    // but default here is always viewer for self-registration.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || ROLES.VIEWER,
      status: USER_STATUS.ACTIVE,
    });

    const token = generateToken(user);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmailWithPassword(email);

    if (!user) throw new AppError('Invalid email or password', 401);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new AppError('Invalid email or password', 401);

    if (user.status === USER_STATUS.INACTIVE) {
      throw new AppError(
        'Your account has been deactivated. Contact an administrator.',
        403,
      );
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);

    return { user: safeUser, token };
  },
};
