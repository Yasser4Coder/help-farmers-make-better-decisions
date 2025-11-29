const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const RecommendationService = require("../services/recommendation.service");
const { StatusCodes } = require("../constants");

/**
 * Get crop recommendations for a land
 */
const getCropRecommendations = catchAsync(async (req, res) => {
  const { farmerId, landId } = req.params;

  const farmerIdNum = parseInt(farmerId, 10);
  const landIdNum = parseInt(landId, 10);

  if (isNaN(farmerIdNum) || isNaN(landIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID or land ID",
    });
  }

  const recommendations = await RecommendationService.getCropRecommendations(
    farmerIdNum,
    landIdNum
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    recommendations,
    "Crop recommendations retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getCropRecommendations,
};

