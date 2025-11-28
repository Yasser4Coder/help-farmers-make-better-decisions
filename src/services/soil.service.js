const { SectionSoil, Land, Farmer } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { sequelize } = require("../config/db");

/**
 * Soil Service
 */
class SoilService {
  /**
   * Calculate soil health score based on various parameters
   */
  static calculateSoilHealthScore(soilData) {
    let score = 0;
    let factors = 0;

    // pH level (optimal range: 6.0-7.5)
    if (soilData.ph !== null && soilData.ph !== undefined) {
      factors++;
      if (soilData.ph >= 6.0 && soilData.ph <= 7.5) {
        score += 20; // Optimal
      } else if (soilData.ph >= 5.5 && soilData.ph < 6.0) {
        score += 15; // Slightly acidic
      } else if (soilData.ph > 7.5 && soilData.ph <= 8.0) {
        score += 15; // Slightly alkaline
      } else {
        score += 5; // Too acidic or alkaline
      }
    }

    // Soil Moisture (optimal range: 40-60%)
    if (soilData.soilMoisture !== null && soilData.soilMoisture !== undefined) {
      factors++;
      if (soilData.soilMoisture >= 40 && soilData.soilMoisture <= 60) {
        score += 20; // Optimal
      } else if (soilData.soilMoisture >= 30 && soilData.soilMoisture < 40) {
        score += 15; // Low
      } else if (soilData.soilMoisture > 60 && soilData.soilMoisture <= 70) {
        score += 15; // High
      } else {
        score += 5; // Too low or too high
      }
    }

    // Electrical Conductivity (optimal: < 2.0 dS/m)
    if (
      soilData.electricalConductivity !== null &&
      soilData.electricalConductivity !== undefined
    ) {
      factors++;
      if (soilData.electricalConductivity < 2.0) {
        score += 20; // Optimal
      } else if (soilData.electricalConductivity >= 2.0 && soilData.electricalConductivity < 4.0) {
        score += 10; // Moderate
      } else {
        score += 5; // High salinity
      }
    }

    // Organic Matter/Carbon (optimal: > 2%)
    if (
      soilData.organicCarbon !== null &&
      soilData.organicCarbon !== undefined
    ) {
      factors++;
      if (soilData.organicCarbon >= 2.0) {
        score += 20; // Optimal
      } else if (soilData.organicCarbon >= 1.0 && soilData.organicCarbon < 2.0) {
        score += 10; // Moderate
      } else {
        score += 5; // Low
      }
    }

    // Nitrogen/Nitrite (optimal: > 20 ppm)
    const nitrogen = soilData.nitrogen || 0;
    if (nitrogen > 0) {
      factors++;
      if (nitrogen >= 20) {
        score += 20; // Optimal
      } else if (nitrogen >= 10 && nitrogen < 20) {
        score += 10; // Moderate
      } else {
        score += 5; // Low
      }
    }

    // Calculate average score
    const healthScore = factors > 0 ? Math.round(score / factors) : 0;
    return healthScore;
  }

  /**
   * Determine overall status based on health score
   */
  static getOverallStatus(healthScore) {
    if (healthScore >= 80) {
      return "Excellent";
    } else if (healthScore >= 60) {
      return "Good";
    } else if (healthScore >= 40) {
      return "Medium";
    } else if (healthScore >= 20) {
      return "Poor";
    } else {
      return "Very Poor";
    }
  }

  /**
   * Get soil data by farmer, land, and section
   */
  static async getSoilDataByFarmerLandSection(farmerId, landId, section) {
    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Verify land exists and belongs to farmer
    const land = await Land.findOne({
      where: {
        id: landId,
        clientId: farmerId,
      },
    });

    if (!land) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Land not found or does not belong to this farmer"
      );
    }

    // Get soil data for the specific section
    const results = await sequelize.query(
      `SELECT 
         id,
         client_id,
         land_id,
         section,
         soil_moisture,
         ph,
         electrical_conductivity,
         organic_carbon,
         nitrogen,
         phosphorus,
         potassium,
         soil_type,
         lat,
         lng,
         created_at,
         updated_at
       FROM section_soils 
       WHERE client_id = :farmerId 
       AND land_id = :landId 
       AND section = :section
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { farmerId, landId, section },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Soil data not found for the specified farmer, land, and section"
      );
    }

    const row = results[0];

    // Prepare soil data
    const soilData = {
      id: row.id,
      farmerId: row.client_id,
      landId: row.land_id,
      section: row.section,
      soilMoisture: row.soil_moisture ? parseFloat(row.soil_moisture) : null,
      soilTemperature: null, // Not in database yet
      ph: row.ph ? parseFloat(row.ph) : null,
      electricalConductivity: row.electrical_conductivity
        ? parseFloat(row.electrical_conductivity)
        : null,
      organicMatter: row.organic_carbon
        ? parseFloat(row.organic_carbon)
        : null,
      nitrite: row.nitrogen ? parseFloat(row.nitrogen) : null, // Using nitrogen as nitrite
      nitrogen: row.nitrogen ? parseFloat(row.nitrogen) : null,
      phosphorus: row.phosphorus ? parseFloat(row.phosphorus) : null,
      potassium: row.potassium ? parseFloat(row.potassium) : null,
      soilType: row.soil_type,
      latitude: row.lat ? parseFloat(row.lat) : null,
      longitude: row.lng ? parseFloat(row.lng) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Calculate health score and status
    const healthScore = this.calculateSoilHealthScore(soilData);
    const overallStatus = this.getOverallStatus(healthScore);

    return {
      ...soilData,
      soilHealthScore: healthScore,
      overallStatus: overallStatus,
    };
  }

  /**
   * Get all soil sections for a farmer and land
   */
  static async getSoilSectionsByFarmerLand(farmerId, landId) {
    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Verify land exists and belongs to farmer
    const land = await Land.findOne({
      where: {
        id: landId,
        clientId: farmerId,
      },
    });

    if (!land) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Land not found or does not belong to this farmer"
      );
    }

    // Get all sections for this land
    const results = await sequelize.query(
      `SELECT DISTINCT section 
       FROM section_soils 
       WHERE client_id = :farmerId 
       AND land_id = :landId 
       AND section IS NOT NULL
       ORDER BY section`,
      {
        replacements: { farmerId, landId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return results.map((row) => row.section);
  }
}

module.exports = SoilService;

