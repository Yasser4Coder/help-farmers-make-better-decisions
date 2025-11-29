const { query, param } = require("express-validator");

/**
 * Validation rules for Alert endpoints
 */
const alertValidation = {
  getMyAlerts: [
    query("alertType")
      .optional()
      .isIn(["irrigation", "temperature", "rainfall", "wind"])
      .withMessage(
        "Alert type must be one of: irrigation, temperature, rainfall, wind"
      ),
    query("landId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a non-negative integer"),
  ],
  getAlertsByFarmerId: [
    param("farmerId")
      .isInt({ min: 1 })
      .withMessage("Farmer ID must be a positive integer"),
    query("alertType")
      .optional()
      .isIn(["irrigation", "temperature", "rainfall", "wind"])
      .withMessage(
        "Alert type must be one of: irrigation, temperature, rainfall, wind"
      ),
    query("landId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a non-negative integer"),
  ],
  getAlertById: [
    param("alertId")
      .isInt({ min: 1 })
      .withMessage("Alert ID must be a positive integer"),
  ],
};

module.exports = alertValidation;

