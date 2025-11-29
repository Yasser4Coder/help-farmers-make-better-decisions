const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendation.controller");
const recommendationValidation = require("../validations/recommendation.validation");
const validate = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   - name: Recommendations
 *     description: "Crop recommendation endpoints using content-based similarity"
 */

/**
 * @swagger
 * /api/recommendations/{farmerId}/{landId}:
 *   get:
 *     summary: Get crop recommendations for a specific land
 *     description: Uses content-based similarity (cosine similarity) to recommend crops based on weather, soil, and land data. Returns top 3 most similar crops matching the land's conditions.
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Farmer ID
 *         example: 1
 *       - in: path
 *         name: landId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Land ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Crop recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     landProfile:
 *                       type: object
 *                       description: Aggregated land profile based on weather and soil data
 *                       properties:
 *                         minTemperature:
 *                           type: number
 *                           nullable: true
 *                         maxTemperature:
 *                           type: number
 *                           nullable: true
 *                         minRainfall:
 *                           type: number
 *                           nullable: true
 *                         maxRainfall:
 *                           type: number
 *                           nullable: true
 *                         minPh:
 *                           type: number
 *                           nullable: true
 *                         maxPh:
 *                           type: number
 *                           nullable: true
 *                         idealPh:
 *                           type: number
 *                           nullable: true
 *                         nitrogenNeeds:
 *                           type: number
 *                           nullable: true
 *                         phosphorusNeeds:
 *                           type: number
 *                           nullable: true
 *                         potassiumNeeds:
 *                           type: number
 *                           nullable: true
 *                         dailySunlightHours:
 *                           type: number
 *                           nullable: true
 *                         soilTypeRequirements:
 *                           type: string
 *                           nullable: true
 *                         waterRequirement:
 *                           type: string
 *                           enum: [Low, Medium, High]
 *                           nullable: true
 *                         growingSeason:
 *                           type: string
 *                           nullable: true
 *                     recommendations:
 *                       type: array
 *                       description: Top 3 crop recommendations sorted by similarity score
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank:
 *                             type: integer
 *                             description: Rank of recommendation (1-3)
 *                             example: 1
 *                           cropRecId:
 *                             type: integer
 *                             example: 5
 *                           cropName:
 *                             type: string
 *                             example: "Wheat"
 *                           similarityScore:
 *                             type: number
 *                             description: Cosine similarity score (0-1)
 *                             example: 0.8523
 *                           similarityPercentage:
 *                             type: number
 *                             description: Similarity as percentage (0-100)
 *                             example: 85.23
 *                           cropData:
 *                             type: object
 *                             description: Complete crop recommendation data
 *                             properties:
 *                               growingSeason:
 *                                 type: string
 *                                 enum: [Kharif, Rabi, Summer, Winter]
 *                               minTemperature:
 *                                 type: number
 *                                 nullable: true
 *                               maxTemperature:
 *                                 type: number
 *                                 nullable: true
 *                               minRainfall:
 *                                 type: number
 *                                 nullable: true
 *                               maxRainfall:
 *                                 type: number
 *                                 nullable: true
 *                               soilTypeRequirements:
 *                                 type: string
 *                                 nullable: true
 *                               minPh:
 *                                 type: number
 *                                 nullable: true
 *                               maxPh:
 *                                 type: number
 *                                 nullable: true
 *                               idealPh:
 *                                 type: number
 *                                 nullable: true
 *                               waterRequirement:
 *                                 type: string
 *                                 enum: [Low, Medium, High]
 *                                 nullable: true
 *                               dailySunlightHours:
 *                                 type: number
 *                                 nullable: true
 *                               maturityDuration:
 *                                 type: integer
 *                                 nullable: true
 *                               expectedYieldPerHectare:
 *                                 type: number
 *                                 nullable: true
 *                 message:
 *                   type: string
 *                   example: "Crop recommendations retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid parameters or insufficient data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Insufficient data for recommendations"
 *       404:
 *         description: Land not found or no crop recommendations available
 */
router.get(
  "/:farmerId/:landId",
  validate(recommendationValidation.getCropRecommendations),
  recommendationController.getCropRecommendations
);

module.exports = router;

