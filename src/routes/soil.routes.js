const express = require("express");
const router = express.Router();
const soilController = require("../controllers/soil.controller");
const soilValidation = require("../validations/soil.validation");
const validate = require("../middlewares/validate.middleware");
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
 * /api/soil/iot/upload:
 *   post:
 *     summary: Upload soil data from IoT device
 *     description: Endpoint for IoT devices to upload soil sensor data. Creates a new soil record or updates an existing one for the specified farmer, land, and section. All soil parameters are optional except clientId and landId.
 *     tags: [Soil]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - landId
 *             properties:
 *               clientId:
 *                 type: integer
 *                 description: Farmer/Client ID
 *                 example: 1
 *               landId:
 *                 type: integer
 *                 description: Land ID
 *                 example: 1
 *               section:
 *                 type: string
 *                 description: Section identifier (e.g., "A1", "B2")
 *                 example: "A1"
 *               soilMoisture:
 *                 type: number
 *                 description: Soil moisture percentage
 *                 example: 45.5
 *               nitrogen:
 *                 type: number
 *                 description: Nitrogen level (mg/kg)
 *                 example: 25.5
 *               phosphorus:
 *                 type: number
 *                 description: Phosphorus level (mg/kg)
 *                 example: 18.2
 *               potassium:
 *                 type: number
 *                 description: Potassium level (mg/kg)
 *                 example: 120.5
 *               ph:
 *                 type: number
 *                 description: pH level (0-14)
 *                 example: 6.8
 *               organicCarbon:
 *                 type: number
 *                 description: Organic carbon content
 *                 example: 2.5
 *               electricalConductivity:
 *                 type: number
 *                 description: Electrical conductivity (salinity) in dS/m
 *                 example: 1.5
 *               soilType:
 *                 type: string
 *                 description: Type of soil
 *                 example: "Clay"
 *               microNutrients:
 *                 type: string
 *                 description: Micro-nutrients information
 *                 example: "Iron: 5.2mg/kg, Zinc: 2.1mg/kg"
 *               lat:
 *                 type: number
 *                 description: Latitude coordinate
 *                 example: 36.7538
 *               lng:
 *                 type: number
 *                 description: Longitude coordinate
 *                 example: 3.0588
 *     responses:
 *       200:
 *         description: Soil data saved successfully
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
 *                       description: Soil record ID
 *                       example: 1
 *                     clientId:
 *                       type: integer
 *                       example: 1
 *                     landId:
 *                       type: integer
 *                       example: 1
 *                     section:
 *                       type: string
 *                       nullable: true
 *                       example: "A1"
 *                     action:
 *                       type: string
 *                       enum: [created, updated]
 *                       description: Whether the record was created or updated
 *                       example: "created"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T12:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T12:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Soil data saved successfully from IoT device"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or invalid request
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
 *                   example: "Validation failed"
 *       404:
 *         description: Farmer or land not found
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
 *                   example: "Land not found or does not belong to this farmer"
 */
router.post(
  "/iot/upload",
  apiLimiter,
  validate(soilValidation.saveIoTSoilData),
  soilController.saveIoTSoilData
);

/**
 * @swagger
 * /api/soil/farmer/{farmerId}/status:
 *   get:
 *     summary: Get overall soil status for a specific farmer
 *     description: Retrieves aggregated soil health status for a farmer across all their lands and sections. Returns overall health score, status, and breakdown by land.
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
 *     responses:
 *       200:
 *         description: Soil status retrieved successfully
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
 *                     farmerId:
 *                       type: integer
 *                       example: 1
 *                     overallHealthScore:
 *                       type: integer
 *                       description: Average soil health score across all sections (0-100)
 *                       example: 75
 *                     overallStatus:
 *                       type: string
 *                       description: Overall soil health status
 *                       enum: [Excellent, Good, Medium, Poor, Very Poor]
 *                       example: "Good"
 *                     totalSections:
 *                       type: integer
 *                       description: Total number of sections analyzed
 *                       example: 5
 *                     landsCount:
 *                       type: integer
 *                       description: Number of lands
 *                       example: 2
 *                     landsBreakdown:
 *                       type: array
 *                       description: Breakdown of soil status by land
 *                       items:
 *                         type: object
 *                         properties:
 *                           landId:
 *                             type: integer
 *                             example: 1
 *                           averageHealthScore:
 *                             type: integer
 *                             example: 78
 *                           status:
 *                             type: string
 *                             enum: [Excellent, Good, Medium, Poor, Very Poor]
 *                             example: "Good"
 *                           sectionsCount:
 *                             type: integer
 *                             example: 3
 *                           sections:
 *                             type: array
 *                             description: Individual section statuses
 *                             items:
 *                               type: object
 *                               properties:
 *                                 section:
 *                                   type: string
 *                                   example: "A1"
 *                                 healthScore:
 *                                   type: integer
 *                                   example: 80
 *                                 status:
 *                                   type: string
 *                                   enum: [Excellent, Good, Medium, Poor, Very Poor]
 *                                   example: "Good"
 *                 message:
 *                   type: string
 *                   example: "Soil status retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid farmer ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Farmer not found or no soil data available
 */
router.get(
  "/farmer/:farmerId/status",
  apiLimiter,
  authenticateIng,
  soilController.getSoilStatusByFarmer
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
 *                     parameters:
 *                       type: array
 *                       description: Array of 8 soil parameters formatted for dashboard display
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Moisture (%)"
 *                           value:
 *                             type: string
 *                             description: Formatted value (may be range or single value with unit)
 *                             example: "15% to 18%"
 *                           icon:
 *                             type: string
 *                             example: "moisture"
 *                           color:
 *                             type: string
 *                             example: "green"
 *                     soilHealthScore:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                           description: Soil health score (0-100)
 *                           example: 66
 *                         percentage:
 *                           type: string
 *                           description: Score as percentage string
 *                           example: "66%"
 *                         overallStatus:
 *                           type: string
 *                           description: Overall status in lowercase
 *                           enum: [excellent, good, medium, poor, very poor]
 *                           example: "medium"
 *                     rawData:
 *                       type: object
 *                       description: Raw soil data for backward compatibility
 *                       properties:
 *                         id:
 *                           type: integer
 *                         farmerId:
 *                           type: integer
 *                         landId:
 *                           type: integer
 *                         section:
 *                           type: string
 *                         soilMoisture:
 *                           type: number
 *                           nullable: true
 *                         soilTemperature:
 *                           type: number
 *                           nullable: true
 *                         ph:
 *                           type: number
 *                           nullable: true
 *                         electricalConductivity:
 *                           type: number
 *                           nullable: true
 *                         organicMatter:
 *                           type: number
 *                           nullable: true
 *                         nitrogen:
 *                           type: number
 *                           nullable: true
 *                         phosphorus:
 *                           type: number
 *                           nullable: true
 *                         potassium:
 *                           type: number
 *                           nullable: true
 *                         soilHealthScore:
 *                           type: integer
 *                         overallStatus:
 *                           type: string
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

module.exports = router;

