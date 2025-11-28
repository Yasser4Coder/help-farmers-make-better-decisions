const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const NotificationService = require("../services/notification.service");
const { StatusCodes } = require("../constants");

/**
 * Send notification to a single device
 */
const sendToDevice = catchAsync(async (req, res) => {
  const { fcmToken, notification, data } = req.body;

  const result = await NotificationService.sendToDevice(fcmToken, notification, data);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notification sent successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Send notification to multiple devices
 */
const sendToMultipleDevices = catchAsync(async (req, res) => {
  const { fcmTokens, notification, data } = req.body;

  const result = await NotificationService.sendToMultipleDevices(
    fcmTokens,
    notification,
    data
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notifications sent successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Send notification to all farmers
 */
const sendToAllFarmers = catchAsync(async (req, res) => {
  const { notification, data } = req.body;

  const result = await NotificationService.sendToAllFarmers(notification, data);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notifications sent to all farmers successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Send notification to all engineers
 */
const sendToAllEngineers = catchAsync(async (req, res) => {
  const { notification, data } = req.body;

  const result = await NotificationService.sendToAllEngineers(notification, data);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notifications sent to all engineers successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Send notification to specific farmer
 */
const sendToFarmer = catchAsync(async (req, res) => {
  const { farmerId } = req.params;
  const { notification, data } = req.body;

  const result = await NotificationService.sendToFarmer(
    farmerId,
    notification,
    data
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notification sent to farmer successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Send notification to specific engineer
 */
const sendToEngineer = catchAsync(async (req, res) => {
  const { engineerId } = req.params;
  const { notification, data } = req.body;

  const result = await NotificationService.sendToEngineer(
    engineerId,
    notification,
    data
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Notification sent to engineer successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Update FCM token for current farmer
 */
const updateFarmerToken = catchAsync(async (req, res) => {
  const { fcmToken } = req.body;
  const farmerId = req.farmer.id;

  const farmer = await NotificationService.updateFarmerToken(farmerId, fcmToken);

  const response = new ApiResponse(
    StatusCodes.OK,
    { farmerId: farmer.id, fcmToken: farmer.fcmToken },
    "FCM token updated successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Update FCM token for current engineer
 */
const updateEngineerToken = catchAsync(async (req, res) => {
  const { fcmToken } = req.body;
  const engineerId = req.ing.id;

  const engineer = await NotificationService.updateEngineerToken(
    engineerId,
    fcmToken
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    { engineerId: engineer.id, fcmToken: engineer.fcmToken },
    "FCM token updated successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  sendToDevice,
  sendToMultipleDevices,
  sendToAllFarmers,
  sendToAllEngineers,
  sendToFarmer,
  sendToEngineer,
  updateFarmerToken,
  updateEngineerToken,
};

