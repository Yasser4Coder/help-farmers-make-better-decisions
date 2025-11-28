const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const FarmerAuthService = require("../services/farmerAuth.service");
const { StatusCodes } = require("../constants");

/**
 * Login farmer
 */
const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const result = await FarmerAuthService.login(username, password);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Farmer logged in successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get current farmer profile
 */
const getProfile = catchAsync(async (req, res) => {
  const farmer = await FarmerAuthService.getProfile(req.farmer.id);

  const response = new ApiResponse(
    StatusCodes.OK,
    farmer,
    "Farmer profile retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  login,
  getProfile,
};

