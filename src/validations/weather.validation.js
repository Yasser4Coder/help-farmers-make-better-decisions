const { body, param } = require("express-validator");

/**
 * Validation rules for Weather endpoints
 */
const weatherValidation = {
  fetchAndSave: [
    body("landId")
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
  ],
  getForecast: [
    param("landId")
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
  ],
};

module.exports = weatherValidation;

