const { body, param } = require("express-validator");

/**
 * Validation rules for notification routes
 */
const notificationValidation = {
  // Send to device validation
  sendToDevice: [
    body("fcmToken")
      .trim()
      .notEmpty()
      .withMessage("FCM token is required"),
    body("notification.title")
      .trim()
      .notEmpty()
      .withMessage("Notification title is required")
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("notification.body")
      .trim()
      .notEmpty()
      .withMessage("Notification body is required")
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("notification.image")
      .optional()
      .isURL()
      .withMessage("Notification image must be a valid URL"),
    body("data")
      .optional()
      .isObject()
      .withMessage("Data must be an object"),
  ],

  // Send to multiple devices validation
  sendToMultipleDevices: [
    body("fcmTokens")
      .isArray({ min: 1 })
      .withMessage("At least one FCM token is required"),
    body("fcmTokens.*")
      .trim()
      .notEmpty()
      .withMessage("FCM tokens cannot be empty"),
    body("notification.title")
      .trim()
      .notEmpty()
      .withMessage("Notification title is required")
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("notification.body")
      .trim()
      .notEmpty()
      .withMessage("Notification body is required")
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("notification.image")
      .optional()
      .isURL()
      .withMessage("Notification image must be a valid URL"),
    body("data")
      .optional()
      .isObject()
      .withMessage("Data must be an object"),
  ],

  // Send to all farmers/engineers validation
  sendToAll: [
    body("notification.title")
      .trim()
      .notEmpty()
      .withMessage("Notification title is required")
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("notification.body")
      .trim()
      .notEmpty()
      .withMessage("Notification body is required")
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("notification.image")
      .optional()
      .isURL()
      .withMessage("Notification image must be a valid URL"),
    body("data")
      .optional()
      .isObject()
      .withMessage("Data must be an object"),
  ],

  // Send to specific farmer/engineer validation
  sendToUser: [
    param("farmerId")
      .optional()
      .isInt()
      .withMessage("Invalid farmer ID"),
    param("engineerId")
      .optional()
      .isInt()
      .withMessage("Invalid engineer ID"),
    body("notification.title")
      .trim()
      .notEmpty()
      .withMessage("Notification title is required")
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("notification.body")
      .trim()
      .notEmpty()
      .withMessage("Notification body is required")
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("notification.image")
      .optional()
      .isURL()
      .withMessage("Notification image must be a valid URL"),
    body("data")
      .optional()
      .isObject()
      .withMessage("Data must be an object"),
  ],

  // Update token validation
  updateToken: [
    body("fcmToken")
      .trim()
      .notEmpty()
      .withMessage("FCM token is required"),
  ],
};

module.exports = notificationValidation;

