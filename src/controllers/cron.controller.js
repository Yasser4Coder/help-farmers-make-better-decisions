const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const CronService = require("../services/cron.service");
const { StatusCodes } = require("../constants");

/**
 * Start weather cron job
 */
const startWeatherCron = catchAsync(async (req, res) => {
  const result = await CronService.startWeatherCronJob();

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Weather cron job started successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Stop weather cron job
 */
const stopWeatherCron = catchAsync(async (req, res) => {
  const result = CronService.stopWeatherCronJob();

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Weather cron job stopped successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get cron job status
 */
const getCronStatus = catchAsync(async (req, res) => {
  const status = CronService.getStatus();

  const response = new ApiResponse(
    StatusCodes.OK,
    status,
    "Cron job status retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Manually trigger alert generation (for testing)
 */
const triggerAlertGeneration = catchAsync(async (req, res) => {
  const result = await CronService.generateAlertsForAllFarmers();

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Alert generation completed"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  startWeatherCron,
  stopWeatherCron,
  getCronStatus,
  triggerAlertGeneration,
};
