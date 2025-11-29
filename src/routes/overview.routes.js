const express = require("express");
const router = express.Router();
const overviewController = require("../controllers/overview.controller");
const { authenticateIng } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Overview
 *     description: "Dashboard overview endpoints"
 */

/**
 * @swagger
 * /api/overview:
 *   get:
 *     summary: Get dashboard overview data
 *     description: Retrieves overview statistics and table data for the authenticated engineer, including total farmers, farmers needing attention, average soil moisture, and a detailed table with farmer information.
 *     tags: [Overview]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview data retrieved successfully
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalFarmers:
 *                           type: integer
 *                           description: Total number of farmers connected to the engineer
 *                           example: 27
 *                         farmersNeedingAttention:
 *                           type: integer
 *                           description: Number of farmers that need attention (low/high soil moisture or extreme weather)
 *                           example: 45
 *                         averageSoilMoisture:
 *                           type: number
 *                           description: Average soil moisture percentage across all farmers
 *                           example: 45.5
 *                     tableData:
 *                       type: array
 *                       description: Table data with farmer details
 *                       items:
 *                         type: object
 *                         properties:
 *                           farmerName:
 *                             type: string
 *                             example: "taha laib"
 *                           cropType:
 *                             type: string
 *                             example: "Rice"
 *                           soilMoisture:
 *                             type: string
 *                             description: Soil moisture percentage
 *                             example: "6.2"
 *                           location:
 *                             type: string
 *                             description: Location name (city)
 *                             example: "Msila"
 *                           weatherImpact:
 *                             type: string
 *                             description: Weather impact status
 *                             enum: [Great, Medium, Bad, N/A]
 *                             example: "Bad"
 *                 message:
 *                   type: string
 *                   example: "Overview data retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
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
 */
router.get(
  "/",
  apiLimiter,
  authenticateIng,
  overviewController.getOverview
);

module.exports = router;

