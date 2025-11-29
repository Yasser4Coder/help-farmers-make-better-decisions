const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const OverviewService = require("../services/overview.service");
const { StatusCodes } = require("../constants");

/**
 * Get overview/dashboard data for authenticated engineer
 */
const getOverview = catchAsync(async (req, res) => {
  const engineerId = req.ing.id; // Get from authenticated engineer

  const overviewData = await OverviewService.getOverviewData(engineerId);

  const response = new ApiResponse(
    StatusCodes.OK,
    overviewData,
    "Overview data retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getOverview,
};

