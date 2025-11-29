const { body } = require("express-validator");

/**
 * Validation rules for Grafana endpoints
 */
const grafanaValidation = {
  generateGraphUrl: [
    body("farmerId")
      .isInt({ min: 1 })
      .withMessage("Farmer ID must be a positive integer"),
    body("landId")
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
    body("column")
      .notEmpty()
      .withMessage("Column is required")
      .isString()
      .withMessage("Column must be a string"),
    body("plotType")
      .notEmpty()
      .withMessage("Plot type is required")
      .isString()
      .withMessage("Plot type must be a string")
      .isIn(["time series", "histogram"])
      .withMessage("Plot type must be either 'time series' or 'histogram'"),
    body("tables")
      .notEmpty()
      .withMessage("Tables is required")
      .isString()
      .withMessage("Tables must be a string"),
    body("sectionId")
      .optional()
      .isString()
      .withMessage("Section ID must be a string"),
  ],
};

module.exports = grafanaValidation;

