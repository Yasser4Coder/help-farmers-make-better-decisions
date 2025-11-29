const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const WeatherService = require("../services/weather.service");
const CronService = require("../services/cron.service");
const { StatusCodes } = require("../constants");
const { Land } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

/**
 * Fetch and save weather data for a location
 * Always fetches 3 months of data from today
 * Also starts the cron job if it's not already running
 */
const fetchAndSaveWeather = catchAsync(async (req, res) => {
  const { landId } = req.body;

  // Fetch land data to get lat, lng, and clientId
  const land = await Land.findByPk(landId);
  
  if (!land) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Land not found");
  }

  if (!land.lat || !land.lng) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Land does not have latitude and longitude coordinates"
    );
  }

  // Start cron job if not already running
  try {
    await CronService.startWeatherCronJob();
    logger.info("Weather cron job started automatically from fetch-and-save endpoint");
  } catch (error) {
    // Log error but don't fail the request
    logger.warn("Error starting cron job:", error.message);
  }

  // Always calculate 3 months from today
  const today = new Date();
  const end = today.toISOString().split("T")[0];
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const start = threeMonthsAgo.toISOString().split("T")[0];

  const result = await WeatherService.saveWeatherData(
    landId,
    land.clientId,
    parseFloat(land.lat),
    parseFloat(land.lng),
    start,
    end
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Weather data fetched and saved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  fetchAndSaveWeather,
};

