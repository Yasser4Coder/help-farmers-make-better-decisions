const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const IngAuthService = require("../services/ingAuth.service");
const { StatusCodes } = require("../constants");

/**
 * Login engineer
 */
const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const result = await IngAuthService.login(username, password);

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Engineer logged in successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get current engineer profile
 */
const getProfile = catchAsync(async (req, res) => {
  const ing = await IngAuthService.getProfile(req.ing.id);

  const response = new ApiResponse(
    StatusCodes.OK,
    ing,
    "Engineer profile retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  login,
  getProfile,
};

