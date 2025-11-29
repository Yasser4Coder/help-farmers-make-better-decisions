const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const AlertService = require("../services/alert.service");
const { StatusCodes } = require("../constants");

/**
 * Get alerts for authenticated farmer
 */
const getMyAlerts = catchAsync(async (req, res) => {
  const farmerId = req.userId; // From authentication middleware (authenticateFarmer)
  const { alertType, landId, limit, offset } = req.query;

  const filters = {
    alertType,
    landId: landId ? parseInt(landId, 10) : null,
    limit,
    offset,
  };

  const result = await AlertService.getAlertsByFarmer(farmerId, filters);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Alerts retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get alerts for a specific farmer (for engineers)
 */
const getAlertsByFarmerId = catchAsync(async (req, res) => {
  const farmerId = parseInt(req.params.farmerId, 10);
  const { alertType, landId, limit, offset } = req.query;

  if (isNaN(farmerId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID",
    });
  }

  const filters = {
    alertType,
    landId: landId ? parseInt(landId, 10) : null,
    limit,
    offset,
  };

  const result = await AlertService.getAlertsByFarmer(farmerId, filters);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Alerts retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get a specific alert by ID
 */
const getAlertById = catchAsync(async (req, res) => {
  const alertId = parseInt(req.params.alertId, 10);
  const farmerId = req.userId; // From authentication middleware (authenticateFarmer)

  if (isNaN(alertId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid alert ID",
    });
  }

  const alert = await AlertService.getAlertById(alertId, farmerId);

  const response = new ApiResponse(
    StatusCodes.OK,
    alert,
    "Alert retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getMyAlerts,
  getAlertsByFarmerId,
  getAlertById,
};

