const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of validation rules
 * @returns {Function} - Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }));

      const error = new ApiError(400, 'Validation failed', true);
      error.errors = extractedErrors;
      return next(error);
    } catch (err) {
      // Catch any unexpected errors during validation
      return next(err);
    }
  };
};

module.exports = validate;

