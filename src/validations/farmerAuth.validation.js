const { body } = require("express-validator");

/**
 * Validation rules for Farmer authentication
 */
const farmerAuthValidation = {
  // Register validation
  register: [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phoneNumber")
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Please provide a valid phone number"),
    body("fcmToken")
      .optional()
      .isString()
      .withMessage("FCM token must be a string"),
  ],
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

