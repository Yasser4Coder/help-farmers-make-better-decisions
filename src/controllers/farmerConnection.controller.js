const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const FarmerConnectionService = require("../services/farmerConnection.service");
const { StatusCodes } = require("../constants");

/**
 * Connect engineer to farmer
 */
const connectToFarmer = catchAsync(async (req, res) => {
  const { username } = req.body;
  const engineerId = req.ing.id; // Get from authenticated engineer

  const connection = await FarmerConnectionService.connectEngineerToFarmer(
    engineerId,
    username
  );

  const response = new ApiResponse(
    StatusCodes.CREATED,
    connection,
    "Engineer connected to farmer successfully"
  );

  res.status(StatusCodes.CREATED).json(response);
});

/**
 * Disconnect engineer from farmer
 */
const disconnectFromFarmer = catchAsync(async (req, res) => {
  const { farmerId } = req.params;
  const engineerId = req.ing.id; // Get from authenticated engineer

  const farmerIdNum = parseInt(farmerId, 10);
  if (isNaN(farmerIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID",
    });
  }

  const result = await FarmerConnectionService.disconnectEngineerFromFarmer(
    engineerId,
    farmerIdNum
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Engineer disconnected from farmer successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  connectToFarmer,
  disconnectFromFarmer,
};

