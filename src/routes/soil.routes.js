const express = require("express");
const router = express.Router();
const soilController = require("../controllers/soil.controller");
const { authenticateIng } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Soil
 *     description: "Soil data management endpoints"
 */

/**
 * @swagger
 * /api/soil/{farmerId}/{landId}/{section}:
 *   get:
 *     summary: Get soil data by farmer, land, and section
 *     description: Retrieves comprehensive soil data including moisture, temperature, pH, electrical conductivity, organic matter, nitrite, and calculated health score with overall status.
 *     tags: [Soil]
 *     security:
 *       - bearerAuth: []
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
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *         description: Section identifier
 *         example: "A1"
 *     responses:
 *       200:
 *         description: Soil data retrieved successfully
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
 *                     id:
 *                       type: integer
 *                     farmerId:
 *                       type: integer
 *                     landId:
 *                       type: integer
 *                     section:
 *                       type: string
 *                     soilMoisture:
 *                       type: number
 *                       description: Soil Moisture (%)
 *                       nullable: true
 *                     soilTemperature:
 *                       type: number
 *                       description: Soil Temperature
 *                       nullable: true
 *                     ph:
 *                       type: number
 *                       description: pH level
 *                       nullable: true
 *                     electricalConductivity:
 *                       type: number
 *                       description: Electrical Conductivity
 *                       nullable: true
 *                     organicMatter:
 *                       type: number
 *                       description: Organic Matter
 *                       nullable: true
 *                     nitrite:
 *                       type: number
 *                       description: Nitrite level
 *                       nullable: true
 *                     soilHealthScore:
 *                       type: integer
 *                       description: Calculated soil health score (0-100)
 *                       example: 75
 *                     overallStatus:
 *                       type: string
 *                       description: Overall soil health status
 *                       enum: [Excellent, Good, Medium, Poor, Very Poor]
 *                       example: "Good"
 *                     nitrogen:
 *                       type: number
 *                       nullable: true
 *                     phosphorus:
 *                       type: number
 *                       nullable: true
 *                     potassium:
 *                       type: number
 *                       nullable: true
 *                     soilType:
 *                       type: string
 *                       nullable: true
 *                     latitude:
 *                       type: number
 *                       nullable: true
 *                     longitude:
 *                       type: number
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Soil data retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid parameters
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
 *                   example: "Invalid farmer ID or land ID"
 *       401:
 *         description: Unauthorized
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
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 *       404:
 *         description: Soil data, farmer, or land not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Soil data not found for the specified farmer, land, and section"
 */
router.get(
  "/:farmerId/:landId/:section",
  apiLimiter,
  authenticateIng,
  soilController.getSoilData
);

/**
 * @swagger
 * /api/soil/{farmerId}/{landId}/sections:
 *   get:
 *     summary: Get all soil sections for a farmer and land
 *     description: Retrieves a list of all available sections for a specific farmer and land.
 *     tags: [Soil]
 *     security:
 *       - bearerAuth: []
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
 *         description: Soil sections retrieved successfully
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
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A1", "A2", "B1"]
 *                     count:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: "Soil sections retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Farmer or land not found
 */
router.get(
  "/:farmerId/:landId/sections",
  apiLimiter,
  authenticateIng,
  soilController.getSoilSections
);

module.exports = router;

