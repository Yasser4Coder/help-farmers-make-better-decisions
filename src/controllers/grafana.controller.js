const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const GrafanaService = require("../services/grafana.service");
const { StatusCodes } = require("../constants");

/**
 * Generate Grafana graph URL
 */
const generateGraphUrl = catchAsync(async (req, res) => {
  const { farmerId, landId, column, plotType, sectionId } = req.body;

  const farmerIdNum = parseInt(farmerId, 10);
  const landIdNum = parseInt(landId, 10);

  if (isNaN(farmerIdNum) || isNaN(landIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID or land ID",
    });
  }

  if (!column || !plotType) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Column and plotType are required",
    });
  }

  const graphData = await GrafanaService.generateGraphUrl(
    farmerIdNum,
    landIdNum,
    column,
    plotType,
    sectionId || null
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    graphData,
    "Grafana graph URL generated successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  generateGraphUrl,
};
