const { body } = require("express-validator");

/**
 * Validation rules for Ing (Engineer) authentication
 */
const ingAuthValidation = {
  // Login validation
  login: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

module.exports = ingAuthValidation;

