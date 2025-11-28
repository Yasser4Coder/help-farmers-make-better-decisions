const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Convert error to ApiError, if needed
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = err;
  
  // Log error
  logger.error(`Error ${statusCode}: ${message}`, {
    error: err,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Send error response
  const response = {
    success: false,
    statusCode: statusCode || 500,
    message: message || 'Internal Server Error'
  };

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode || 500).json(response);
};

module.exports = {
  errorConverter,
  errorHandler
};

