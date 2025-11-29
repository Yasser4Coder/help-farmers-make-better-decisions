const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alert.controller");
const alertValidation = require("../validations/alert.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateFarmer, authenticateIng } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Alerts
 *     description: "Alert management and retrieval endpoints"
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get alerts for authenticated farmer
 *     description: Retrieves alerts for the currently authenticated farmer. Supports filtering by alert type and land ID, with pagination.
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: alertType
 *         schema:
 *           type: string
 *           enum: [irrigation, temperature, rainfall, wind]
 *         description: Filter by alert type
 *       - in: query
 *         name: landId
 *         schema:
 *           type: integer
 *         description: Filter by land ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of alerts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of alerts to skip for pagination
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
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
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           farmerId:
 *                             type: integer
 *                             example: 1
 *                           landId:
 *                             type: integer
 *                             nullable: true
 *                             example: 1
 *                           section:
 *                             type: string
 *                             nullable: true
 *                             example: "A1"
 *                           alertType:
 *                             type: string
 *                             enum: [irrigation, temperature, rainfall, wind]
 *                             example: "irrigation"
 *                           title:
 *                             type: string
 *                             example: "Irrigation Alert"
 *                           description:
 *                             type: string
 *                             example: "Soil moisture is low in sector A1 (25.5%). Immediate irrigation required."
 *                           icon:
 *                             type: string
 *                             example: "irrigation"
 *                           color:
 *                             type: string
 *                             example: "green"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           land:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               lat:
 *                                 type: number
 *                               lng:
 *                                 type: number
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 *                   example: "Alerts retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
router.get(
  "/",
  apiLimiter,
  authenticateFarmer,
  validate(alertValidation.getMyAlerts),
  alertController.getMyAlerts
);

/**
 * @swagger
 * /api/alerts/farmer/{farmerId}:
 *   get:
 *     summary: Get alerts for a specific farmer (Engineer only)
 *     description: Retrieves alerts for a specific farmer. Requires engineer authentication. Supports filtering by alert type and land ID, with pagination.
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Farmer ID
 *       - in: query
 *         name: alertType
 *         schema:
 *           type: string
 *           enum: [irrigation, temperature, rainfall, wind]
 *         description: Filter by alert type
 *       - in: query
 *         name: landId
 *         schema:
 *           type: integer
 *         description: Filter by land ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of alerts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of alerts to skip for pagination
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
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
 *                     alerts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Alert'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 *                   example: "Alerts retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Farmer not found
 *       400:
 *         description: Validation error
 */
router.get(
  "/farmer/:farmerId",
  apiLimiter,
  authenticateIng,
  validate(alertValidation.getAlertsByFarmerId),
  alertController.getAlertsByFarmerId
);

/**
 * @swagger
 * /api/alerts/{alertId}:
 *   get:
 *     summary: Get a specific alert by ID
 *     description: Retrieves details of a specific alert. Farmers can only access their own alerts.
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
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
 *                       example: 1
 *                     farmerId:
 *                       type: integer
 *                       example: 1
 *                     landId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     section:
 *                       type: string
 *                       nullable: true
 *                       example: "A1"
 *                     alertType:
 *                       type: string
 *                       enum: [irrigation, temperature, rainfall, wind]
 *                       example: "irrigation"
 *                     title:
 *                       type: string
 *                       example: "Irrigation Alert"
 *                     description:
 *                       type: string
 *                       example: "Soil moisture is low in sector A1 (25.5%). Immediate irrigation required."
 *                     icon:
 *                       type: string
 *                       example: "irrigation"
 *                     color:
 *                       type: string
 *                       example: "green"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     farmer:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     land:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                 message:
 *                   type: string
 *                   example: "Alert retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 *       400:
 *         description: Validation error
 */
router.get(
  "/:alertId",
  apiLimiter,
  authenticateFarmer,
  validate(alertValidation.getAlertById),
  alertController.getAlertById
);

module.exports = router;

