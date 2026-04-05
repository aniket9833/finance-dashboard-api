/**
 * Send a standardized success response.
 */
export const sendSuccess = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200,
) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send a standardized created response.
 */
export const sendCreated = (
  res,
  data,
  message = 'Resource created successfully',
) => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a standardized error response.
 */
export const sendError = (
  res,
  message = 'An error occurred',
  statusCode = 500,
  errors = null,
) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response.
 */
export const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Build pagination metadata.
 */
export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
