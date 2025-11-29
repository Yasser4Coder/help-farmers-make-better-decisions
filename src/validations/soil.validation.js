const { body } = require("express-validator");

/**
 * Validation rules for Soil endpoints
 */
const soilValidation = {
  saveIoTSoilData: [
    body("clientId")
      .isInt({ min: 1 })
      .withMessage("Client ID (farmer ID) must be a positive integer"),
    body("landId")
      .isInt({ min: 1 })
      .withMessage("Land ID must be a positive integer"),
    body("section")
      .optional()
      .isString()
      .withMessage("Section must be a string"),
    body("soilMoisture")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Soil moisture must be a positive number"),
    body("nitrogen")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Nitrogen must be a positive number"),
    body("phosphorus")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Phosphorus must be a positive number"),
    body("potassium")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Potassium must be a positive number"),
    body("ph")
      .optional()
      .isFloat({ min: 0, max: 14 })
      .withMessage("pH must be a number between 0 and 14"),
    body("organicCarbon")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Organic carbon must be a positive number"),
    body("electricalConductivity")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Electrical conductivity must be a positive number"),
    body("soilType")
      .optional()
      .isString()
      .withMessage("Soil type must be a string"),
    body("microNutrients")
      .optional()
      .isString()
      .withMessage("Micro nutrients must be a string"),
    body("lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90"),
    body("lng")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180"),
  ],
};

module.exports = soilValidation;

