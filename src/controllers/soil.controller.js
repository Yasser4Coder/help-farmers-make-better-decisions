const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const SoilService = require("../services/soil.service");
const { StatusCodes } = require("../constants");

/**
 * Get soil data by farmer, land, and section
 */
const getSoilData = catchAsync(async (req, res) => {
  const { farmerId, landId, section } = req.params;

  const farmerIdNum = parseInt(farmerId, 10);
  const landIdNum = parseInt(landId, 10);

  if (isNaN(farmerIdNum) || isNaN(landIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID or land ID",
    });
  }

  if (!section || section.trim() === "") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Section is required",
    });
  }

  const soilData = await SoilService.getSoilDataByFarmerLandSection(
    farmerIdNum,
    landIdNum,
    section.trim()
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    soilData,
    "Soil data retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Get all sections for a farmer and land
 */
const getSoilSections = catchAsync(async (req, res) => {
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

  const sections = await SoilService.getSoilSectionsByFarmerLand(
    farmerIdNum,
    landIdNum
  );

  const response = new ApiResponse(
    StatusCodes.OK,
    { sections, count: sections.length },
    "Soil sections retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getSoilData,
  getSoilSections,
};

