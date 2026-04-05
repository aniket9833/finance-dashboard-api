import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { validate, registerSchema, loginSchema } from '../validators/index.js';

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Self-register a new viewer account
 * @access Public
 */
router.post('/register', authRateLimiter, validate(registerSchema), register);

/**
 * @route  POST /api/auth/login
 * @desc   Login and receive JWT token
 * @access Public
 */
router.post('/login', authRateLimiter, validate(loginSchema), login);

/**
 * @route  GET /api/auth/me
 * @desc   Get currently authenticated user
 * @access Private
 */
router.get('/me', authenticate, getMe);

export default router;
