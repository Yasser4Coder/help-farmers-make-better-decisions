const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const FarmerService = require("../services/farmer.service");
const { StatusCodes } = require("../constants");

/**
 * Get all farmers
 */
const getAllFarmers = catchAsync(async (req, res) => {
  const farmers = await FarmerService.getAllFarmers();

  const response = new ApiResponse(
    StatusCodes.OK,
    { farmers, count: farmers.length },
    "Farmers retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get farmers by engineer ID
 */
const getFarmersByEngineer = catchAsync(async (req, res) => {
  const engineerId = req.ing.id; // Get from authenticated engineer

  const farmers = await FarmerService.getFarmersByEngineer(engineerId);

  const response = new ApiResponse(
    StatusCodes.OK,
    { farmers, count: farmers.length },
    "Farmers retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get farmer by ID
 */
const getFarmerById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const farmerId = parseInt(id, 10);

  if (isNaN(farmerId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID",
    });
  }

  const farmer = await FarmerService.getFarmerById(farmerId);

  const response = new ApiResponse(
    StatusCodes.OK,
    farmer,
    "Farmer retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get land IDs by farmer ID
 */
const getLandIdsByFarmer = catchAsync(async (req, res) => {
  const { farmerId } = req.params;
  const farmerIdNum = parseInt(farmerId, 10);

  if (isNaN(farmerIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID",
    });
  }

  const landIds = await FarmerService.getLandIdsByFarmerId(farmerIdNum);

  const response = new ApiResponse(
    StatusCodes.OK,
    { landIds },
    "Land IDs retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getAllFarmers,
  getFarmersByEngineer,
  getFarmerById,
  getLandIdsByFarmer,
};

