const express = require("express");
const router = express.Router();
const grafanaController = require("../controllers/grafana.controller");
const grafanaValidation = require("../validations/grafana.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateIng } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Grafana
 *     description: "Grafana graph URL generation endpoints"
 */

/**
 * @swagger
 * /api/grafana/graph-url:
 *   post:
 *     summary: Generate Grafana graph URL
 *     description: Generates a Grafana dashboard URL with embedded graph based on farmer, land, column, and plot type. The URL can be used in an iframe to display the graph.
 *     tags: [Grafana]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmerId
 *               - landId
 *               - column
 *               - plotType
 *             properties:
 *               farmerId:
 *                 type: integer
 *                 description: Farmer ID
 *                 example: 1
 *               landId:
 *                 type: integer
 *                 description: Land ID
 *                 example: 1
 *               column:
 *                 type: string
 *                 description: Column name to display (e.g., "sunlight_hours_per_day", "temperature", "soil_moisture")
 *                 example: "sunlight_hours_per_day"
 *               plotType:
 *                 type: string
 *                 enum: [time series, histogram]
 *                 description: Type of plot to display
 *                 example: "histogram"
 *               tables:
 *                 type: string
 *                 description: Table name(s) - can be newline-separated for multiple tables
 *                 example: "weathers"
 *               sectionId:
 *                 type: string
 *                 nullable: true
 *                 description: Optional section ID for soil data
 *                 example: "A1"
 *     responses:
 *       200:
 *         description: Grafana graph URL generated successfully
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
 *                     url:
 *                       type: string
 *                       description: Full Grafana graph URL
 *                       example: "http://localhost:3000/d/admqj9h/test?orgId=1&from=2025-09-15T08:25:04.203Z&to=2025-10-01T17:04:01.419Z&timezone=browser&var-client_id=1&var-land_id=2&var-section_id=&var-columns=&var-tables=weathers&viewPanel=panel-2&editPanel=2"
 *                     iframeUrl:
 *                       type: string
 *                       description: Same as url, for iframe embedding
 *                       example: "http://localhost:3000/d/admqj9h/test?orgId=1&from=2025-09-15T08:25:04.203Z&to=2025-10-01T17:04:01.419Z&timezone=browser&var-client_id=1&var-land_id=2&var-section_id=&var-columns=&var-tables=weathers&viewPanel=panel-2&editPanel=2"
 *                     farmerId:
 *                       type: integer
 *                       example: 1
 *                     landId:
 *                       type: integer
 *                       example: 1
 *                     column:
 *                       type: string
 *                       example: "sunlight_hours_per_day"
 *                     plotType:
 *                       type: string
 *                       example: "histogram"
 *                     panelId:
 *                       type: string
 *                       description: Panel ID determined from plot type
 *                       example: "panel-3"
 *                     tables:
 *                       type: string
 *                       description: Tables provided in request
 *                       example: "weathers"
 *                     sectionId:
 *                       type: string
 *                       nullable: true
 *                       example: "A1"
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       description: Start date (30 days ago) in ISO format
 *                       example: "2025-09-15T08:25:04.203Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       description: End date (now) in ISO format
 *                       example: "2025-10-01T17:04:01.419Z"
 *                 message:
 *                   type: string
 *                   example: "Grafana graph URL generated successfully"
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
  "/graph-url",
  apiLimiter,
  authenticateIng,
  validate(grafanaValidation.generateGraphUrl),
  grafanaController.generateGraphUrl
);

module.exports = router;

