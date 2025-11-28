const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weather.controller");
const weatherValidation = require("../validations/weather.validation");
const validate = require("../middlewares/validate.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Weather
 *     description: "Weather data management endpoints"
 */

/**
 * @swagger
 * /api/weather/fetch-and-save:
 *   post:
 *     summary: Fetch weather data from API and save to database
 *     description: Fetches 3 months of historical weather data (from today going back 3 months) for a specific land from WeatherAPI and saves it to the database. The latitude, longitude, and client ID are automatically retrieved from the land record.
 *     tags: [Weather]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - landId
 *             properties:
 *               landId:
 *                 type: integer
 *                 description: Land ID (lat, lng, and clientId will be fetched from the land record)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Weather data fetched and saved successfully
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
 *                     totalDays:
 *                       type: integer
 *                       description: Total number of days in the date range
 *                       example: 31
 *                     saved:
 *                       type: integer
 *                       description: Number of records successfully saved/updated
 *                       example: 31
 *                     errors:
 *                       type: integer
 *                       description: Number of records that failed to save
 *                       example: 0
 *                     records:
 *                       type: array
 *                       description: Array of saved records with date and action
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2024-08-01"
 *                           action:
 *                             type: string
 *                             enum: [created, updated]
 *                             example: "created"
 *                           id:
 *                             type: integer
 *                             example: 1
 *                     errorDetails:
 *                       type: array
 *                       description: Array of errors (if any)
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           error:
 *                             type: string
 *                 message:
 *                   type: string
 *                   example: "Weather data fetched and saved successfully"
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       404:
 *         description: Land not found
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
 *                   example: "Land not found"
 *       500:
 *         description: Internal server error or Weather API error
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
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Weather API service unavailable"
 *       503:
 *         description: Service unavailable
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
 *                   example: 503
 *                 message:
 *                   type: string
 *                   example: "Weather API service unavailable"
 */
router.post(
  "/fetch-and-save",
  apiLimiter,
  validate(weatherValidation.fetchAndSave),
  weatherController.fetchAndSaveWeather
);

module.exports = router;

