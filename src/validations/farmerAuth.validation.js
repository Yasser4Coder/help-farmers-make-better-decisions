const { body } = require("express-validator");

/**
 * Validation rules for Farmer authentication
 */
const farmerAuthValidation = {
  // Login validation
  login: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

module.exports = farmerAuthValidation;

