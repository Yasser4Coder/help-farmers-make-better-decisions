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

/**
 * Get overall soil status for a specific farmer
 */
const getSoilStatusByFarmer = catchAsync(async (req, res) => {
  const { farmerId } = req.params;

  const farmerIdNum = parseInt(farmerId, 10);

  if (isNaN(farmerIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid farmer ID",
    });
  }

  const soilStatus = await SoilService.getSoilStatusByFarmer(farmerIdNum);

  const response = new ApiResponse(
    StatusCodes.OK,
    soilStatus,
    "Soil status retrieved successfully"
  );

  res.status(StatusCodes.OK).json(response);
});

/**
 * Save soil data from IoT device
 */
const saveIoTSoilData = catchAsync(async (req, res) => {
  const {
    clientId,
    landId,
    section,
    soilMoisture,
    nitrogen,
    phosphorus,
    potassium,
    ph,
    organicCarbon,
    electricalConductivity,
    soilType,
    microNutrients,
    lat,
    lng,
  } = req.body;

  const clientIdNum = parseInt(clientId, 10);
  const landIdNum = parseInt(landId, 10);

  if (isNaN(clientIdNum) || isNaN(landIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid client ID or land ID",
    });
  }

  const result = await SoilService.saveIoTSoilData({
    clientId: clientIdNum,
    landId: landIdNum,
    section: section || null,
    soilMoisture: soilMoisture !== undefined ? parseFloat(soilMoisture) : undefined,
    nitrogen: nitrogen !== undefined ? parseFloat(nitrogen) : undefined,
    phosphorus: phosphorus !== undefined ? parseFloat(phosphorus) : undefined,
    potassium: potassium !== undefined ? parseFloat(potassium) : undefined,
    ph: ph !== undefined ? parseFloat(ph) : undefined,
    organicCarbon: organicCarbon !== undefined ? parseFloat(organicCarbon) : undefined,
    electricalConductivity:
      electricalConductivity !== undefined ? parseFloat(electricalConductivity) : undefined,
    soilType: soilType || undefined,
    microNutrients: microNutrients || undefined,
    lat: lat !== undefined ? parseFloat(lat) : undefined,
    lng: lng !== undefined ? parseFloat(lng) : undefined,
  });

  const response = new ApiResponse(
    StatusCodes.OK,
    result,
    "Soil data saved successfully from IoT device"
  );

  res.status(StatusCodes.OK).json(response);
});

module.exports = {
  getSoilData,
  getSoilSections,
  getSoilStatusByFarmer,
  saveIoTSoilData,
};

