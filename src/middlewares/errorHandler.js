import { AppError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    const field = err.detail?.match(/Key \((.+?)\)/)?.[1] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  // PostgreSQL check constraint
  if (err.code === '23514') {
    statusCode = 400;
    message = 'Data violates a constraint. Please check your input values';
  }

  // Log non-operational errors in production
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    console.error('[UNHANDLED ERROR]', err);
    message = 'Something went wrong. Please try again later.';
    errors = null;
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ success: false, message, errors });
};

export default errorHandler;
