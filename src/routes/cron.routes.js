const express = require("express");
const router = express.Router();
const cronController = require("../controllers/cron.controller");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Cron Jobs
 *     description: "Cron job management endpoints"
 */

/**
 * @swagger
 * /api/cron/weather/start:
 *   post:
 *     summary: Start weather data fetching cron job
 *     description: Starts a cron job that automatically fetches and updates weather data for all lands every 30 minutes. Existing weather records for the same land, client, and date will be updated instead of creating duplicates.
 *     tags: [Cron Jobs]
 *     responses:
 *       200:
 *         description: Weather cron job started successfully
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
 *                     message:
 *                       type: string
 *                       example: "Weather cron job started successfully"
 *                     schedule:
 *                       type: string
 *                       example: "Every 30 minutes"
 *                     landsCount:
 *                       type: integer
 *                       description: Number of lands that will be processed
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: "Weather cron job started successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Cron job already running
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
 *                   example: "Weather cron job is already running"
 */
router.post(
  "/weather/start",
  apiLimiter,
  cronController.startWeatherCron
);

/**
 * @swagger
 * /api/cron/weather/stop:
 *   post:
 *     summary: Stop weather data fetching cron job
 *     description: Stops the currently running weather data fetching cron job.
 *     tags: [Cron Jobs]
 *     responses:
 *       200:
 *         description: Weather cron job stopped successfully
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
 *                     message:
 *                       type: string
 *                       example: "Weather cron job stopped successfully"
 *                 message:
 *                   type: string
 *                   example: "Weather cron job stopped successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Cron job not running
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
 *                   example: "Weather cron job is not running"
 */
router.post(
  "/weather/stop",
  apiLimiter,
  cronController.stopWeatherCron
);

/**
 * @swagger
 * /api/cron/weather/status:
 *   get:
 *     summary: Get weather cron job status
 *     description: Retrieves the current status of the weather data fetching cron job.
 *     tags: [Cron Jobs]
 *     responses:
 *       200:
 *         description: Cron job status retrieved successfully
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
 *                     isRunning:
 *                       type: boolean
 *                       description: Whether the cron job is scheduled
 *                       example: true
 *                     isExecuting:
 *                       type: boolean
 *                       description: Whether the cron job is currently executing
 *                       example: false
 *                     schedule:
 *                       type: string
 *                       nullable: true
 *                       example: "Every 30 minutes"
 *                 message:
 *                   type: string
 *                   example: "Cron job status retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 */
router.get(
  "/weather/status",
  apiLimiter,
  cronController.getCronStatus
);

module.exports = router;

