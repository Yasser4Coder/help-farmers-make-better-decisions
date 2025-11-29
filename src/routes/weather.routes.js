const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weather.controller");
const weatherValidation = require("../validations/weather.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateIng } = require("../middlewares/auth.middleware");

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
  validate(weatherValidation.fetchAndSave),
  weatherController.fetchAndSaveWeather
);

/**
 * @swagger
 * /api/weather/forecast/{landId}:
 *   get:
 *     summary: Get 3-day weather forecast for a land
 *     description: Retrieves a 3-day weather forecast for a specific land using its coordinates from the database. The forecast includes daily and hourly weather data.
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Land ID (lat and lng will be fetched from the land record)
 *         example: 1
 *     responses:
 *       200:
 *         description: Weather forecast retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   description: Array of 3 forecast days
 *                   items:
 *                     type: object
 *                     properties:
 *                       dayName:
 *                         type: string
 *                         description: Day name with date (e.g., "Today (Sun) Mar 6", "Mon Mar 7")
 *                         example: "Today (Sun) Mar 6"
 *                       condition:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             description: Weather condition text
 *                             example: "Sunny"
 *                           icon:
 *                             type: string
 *                             description: Weather icon URL
 *                             example: "//cdn.weatherapi.com/weather/64x64/day/113.png"
 *                       tempMax:
 *                         type: integer
 *                         description: Maximum temperature in Celsius
 *                         example: 20
 *                       tempMin:
 *                         type: integer
 *                         description: Minimum temperature in Celsius
 *                         example: 15
 *                       aqi:
 *                         type: integer
 *                         description: Air Quality Index (calculated approximation)
 *                         example: 67
 *                 message:
 *                   type: string
 *                   example: "Weather forecast retrieved successfully"
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
 */
router.get(
  "/forecast/:landId",
  validate(weatherValidation.getForecast),
  weatherController.getWeatherForecast
);

/**
 * @swagger
 * /api/weather/today/{landId}:
 *   get:
 *     summary: Get today's weather data for a land
 *     description: Retrieves current day's weather data for a specific land, including rain, temperature, wind, and humidity.
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Land ID (lat and lng will be fetched from the land record)
 *         example: 1
 *     responses:
 *       200:
 *         description: Today's weather data retrieved successfully
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
 *                     rain:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Rainfall in millimeters
 *                           example: 0
 *                         unit:
 *                           type: string
 *                           example: "MM"
 *                     temperature:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Temperature in Celsius
 *                           example: 22
 *                         unit:
 *                           type: string
 *                           example: "°C"
 *                     wind:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Wind speed in kilometers per hour
 *                           example: 20
 *                         unit:
 *                           type: string
 *                           example: "km/H"
 *                     humidity:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Humidity percentage
 *                           example: 40
 *                         unit:
 *                           type: string
 *                           example: "%"
 *                 message:
 *                   type: string
 *                   example: "Today's weather data retrieved successfully"
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
 */
router.get(
  "/today/:landId",
  validate(weatherValidation.getForecast),
  weatherController.getTodayWeather
);

/**
 * @swagger
 * /api/weather/farmer/{farmerId}/status:
 *   get:
 *     summary: Get overall weather status for a specific farmer
 *     description: Retrieves aggregated weather status for a farmer across all their lands. Returns overall weather impact, average conditions, and breakdown by land based on the last 7 days of weather data.
 *     tags: [Weather]
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
 *         description: Weather status retrieved successfully
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
 *                     overallWeatherStatus:
 *                       type: string
 *                       description: Overall weather impact status
 *                       enum: [Great, Medium, Bad, N/A]
 *                       example: "Good"
 *                     overallAverageTemperature:
 *                       type: number
 *                       nullable: true
 *                       description: Average temperature across all lands (°C)
 *                       example: 22.5
 *                     overallTotalRainfall:
 *                       type: number
 *                       description: Total rainfall across all lands (mm)
 *                       example: 15.5
 *                     overallAverageHumidity:
 *                       type: number
 *                       nullable: true
 *                       description: Average humidity across all lands (%)
 *                       example: 65.0
 *                     totalDaysAnalyzed:
 *                       type: integer
 *                       description: Total number of weather records analyzed
 *                       example: 14
 *                     landsCount:
 *                       type: integer
 *                       description: Number of lands
 *                       example: 2
 *                     landsBreakdown:
 *                       type: array
 *                       description: Breakdown of weather status by land
 *                       items:
 *                         type: object
 *                         properties:
 *                           landId:
 *                             type: integer
 *                             example: 1
 *                           location:
 *                             type: string
 *                             example: "Algiers"
 *                           averageTemperature:
 *                             type: number
 *                             nullable: true
 *                             example: 23.0
 *                           totalRainfall:
 *                             type: number
 *                             example: 10.5
 *                           averageHumidity:
 *                             type: number
 *                             nullable: true
 *                             example: 65.5
 *                           weatherStatus:
 *                             type: string
 *                             enum: [Great, Medium, Bad, N/A]
 *                             example: "Great"
 *                           extremeWeatherDays:
 *                             type: integer
 *                             description: Number of days with extreme weather (frost, heatwaves, storms)
 *                             example: 2
 *                           totalDays:
 *                             type: integer
 *                             description: Total number of days with weather data
 *                             example: 7
 *                           latestWeather:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                               temperature:
 *                                 type: number
 *                                 nullable: true
 *                               rainfall:
 *                                 type: number
 *                                 nullable: true
 *                               humidity:
 *                                 type: number
 *                                 nullable: true
 *                               impact:
 *                                 type: string
 *                                 enum: [Great, Medium, Bad, N/A]
 *                 message:
 *                   type: string
 *                   example: "Weather status retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid farmer ID
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
 *                   example: "Invalid farmer ID"
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
 *         description: Farmer not found or no weather data available
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
 *                   example: "No weather data found for this farmer in the last 7 days"
 */
router.get(
  "/farmer/:farmerId/status",
  authenticateIng,
  weatherController.getWeatherStatusByFarmer
);

module.exports = router;

