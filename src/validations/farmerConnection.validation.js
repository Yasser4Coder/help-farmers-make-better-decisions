const { body } = require("express-validator");

/**
 * Validation rules for Farmer Connection endpoints
 */
const farmerConnectionValidation = {
  connect: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Farmer username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
  ],
};

module.exports = farmerConnectionValidation;
