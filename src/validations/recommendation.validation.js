const { param } = require("express-validator");

/**
 * Validation rules for Recommendation endpoints
 */
const recommendationValidation = {
  getCropRecommendations: [
    param("farmerId")
      .isInt({ min: 1 })
      .withMessage("Farmer ID must be a positive integer"),
    param("landId")
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
  ],
};

module.exports = recommendationValidation;

