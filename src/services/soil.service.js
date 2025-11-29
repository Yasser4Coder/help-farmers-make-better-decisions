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

    // Get soil data for the specific section and latest weather temperature
    const results = await sequelize.query(
      `SELECT 
         ss.id,
         ss.client_id,
         ss.land_id,
         ss.section,
         ss.soil_moisture,
         ss.ph,
         ss.electrical_conductivity,
         ss.organic_carbon,
         ss.nitrogen,
         ss.phosphorus,
         ss.potassium,
         ss.soil_type,
         ss.lat,
         ss.lng,
         ss.created_at,
         ss.updated_at,
         (SELECT temperature FROM weathers w 
          WHERE w.land_id = ss.land_id 
          ORDER BY w.time DESC 
          LIMIT 1) as temperature
       FROM section_soils ss
       WHERE ss.client_id = :farmerId 
       AND ss.land_id = :landId 
       AND ss.section = :section
       ORDER BY ss.created_at DESC
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
      soilTemperature: row.temperature ? parseFloat(row.temperature) : null, // Get from weather data
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

    // Format values to match dashboard display
    const formatMoisture = (moisture) => {
      if (moisture === null || moisture === undefined) return null;
      // For display, show as range or single value
      const val = parseFloat(moisture);
      const lower = Math.max(0, Math.round(val - 3));
      const upper = Math.round(val + 3);
      return `${lower}% to ${upper}%`;
    };

    const formatTemperature = (temp) => {
      if (temp === null || temp === undefined) {
        // Default range if no temperature available
        return "15-25 °C";
      }
      // For display, show as range
      const val = parseFloat(temp);
      const lower = Math.max(0, Math.round(val - 5));
      const upper = Math.round(val + 5);
      return `${lower}-${upper} °C`;
    };

    const formatEC = (ec) => {
      if (ec === null || ec === undefined) return null;
      // For display, show as range
      const val = parseFloat(ec);
      const lower = (val - 0.5).toFixed(1);
      const upper = (val + 0.5).toFixed(1);
      return `${lower} – ${upper} dS/m`;
    };

    const formatWithUnit = (value, unit) => {
      if (value === null || value === undefined) return null;
      return `${value} ${unit}`;
    };

    // Build parameters array matching dashboard format
    const parameters = [
      {
        name: "Moisture (%)",
        value: formatMoisture(soilData.soilMoisture) || "N/A",
        icon: "moisture",
        color: "green",
      },
      {
        name: "Temperature",
        value: formatTemperature(soilData.soilTemperature) || "N/A",
        icon: "temperature",
        color: "purple",
      },
      {
        name: "Ph level",
        value: soilData.ph !== null ? soilData.ph.toFixed(1) : "N/A",
        icon: "ph",
        color: "pink",
      },
      {
        name: "Organic carbon",
        value: soilData.organicMatter !== null ? soilData.organicMatter.toFixed(1) : "N/A",
        icon: "organic",
        color: "pink",
      },
      {
        name: "Electrical Conductivity",
        value: formatEC(soilData.electricalConductivity) || "N/A",
        icon: "conductivity",
        color: "blue",
      },
      {
        name: "Potassium (K)",
        value: formatWithUnit(soilData.potassium, "mg/kg") || "N/A",
        icon: "potassium",
        color: "brown",
      },
      {
        name: "Nitrogen Level",
        value: formatWithUnit(soilData.nitrogen, "mg/kg") || "N/A",
        icon: "nitrogen",
        color: "orange",
      },
      {
        name: "Phosphorus (P)",
        value: formatWithUnit(soilData.phosphorus, "mg/kg") || "N/A",
        icon: "phosphorus",
        color: "orange",
      },
    ];

    return {
      parameters: parameters,
      soilHealthScore: {
        score: healthScore,
        percentage: `${healthScore}%`,
        overallStatus: overallStatus.toLowerCase(), // lowercase to match image
      },
      // Also include raw data for backward compatibility
      rawData: {
        ...soilData,
        soilHealthScore: healthScore,
        overallStatus: overallStatus,
      },
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

  /**
   * Get overall soil status for a specific farmer (aggregated across all lands and sections)
   */
  static async getSoilStatusByFarmer(farmerId) {
    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Get all soil records for this farmer (latest record per section)
    const results = await sequelize.query(
      `SELECT 
         ss.id,
         ss.land_id,
         ss.section,
         ss.soil_moisture,
         ss.ph,
         ss.electrical_conductivity,
         ss.organic_carbon,
         ss.nitrogen,
         ss.phosphorus,
         ss.potassium,
         ss.soil_type,
         ss.created_at
       FROM section_soils ss
       INNER JOIN (
         SELECT land_id, section, MAX(created_at) as max_date
         FROM section_soils
         WHERE client_id = :farmerId
         GROUP BY land_id, section
       ) latest ON ss.land_id = latest.land_id 
                  AND ss.section = latest.section 
                  AND ss.created_at = latest.max_date
       WHERE ss.client_id = :farmerId
       ORDER BY ss.land_id, ss.section`,
      {
        replacements: { farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "No soil data found for this farmer"
      );
    }

    // Calculate health scores for each record
    const healthScores = [];
    const landsData = {};

    for (const row of results) {
      const soilData = {
        ph: row.ph ? parseFloat(row.ph) : null,
        soilMoisture: row.soil_moisture ? parseFloat(row.soil_moisture) : null,
        electricalConductivity: row.electrical_conductivity
          ? parseFloat(row.electrical_conductivity)
          : null,
        organicCarbon: row.organic_carbon
          ? parseFloat(row.organic_carbon)
          : null,
        nitrogen: row.nitrogen ? parseFloat(row.nitrogen) : null,
      };

      const healthScore = this.calculateSoilHealthScore(soilData);
      healthScores.push(healthScore);

      // Group by land for breakdown
      const landId = row.land_id;
      if (!landsData[landId]) {
        landsData[landId] = {
          landId: landId,
          sections: [],
          scores: [],
        };
      }
      landsData[landId].sections.push({
        section: row.section,
        healthScore: healthScore,
        status: this.getOverallStatus(healthScore),
      });
      landsData[landId].scores.push(healthScore);
    }

    // Calculate overall average health score
    const overallHealthScore =
      healthScores.length > 0
        ? Math.round(
            healthScores.reduce((sum, score) => sum + score, 0) /
              healthScores.length
          )
        : 0;

    const overallStatus = this.getOverallStatus(overallHealthScore);

    // Calculate average score per land
    const landsBreakdown = Object.values(landsData).map((land) => {
      const avgScore =
        land.scores.length > 0
          ? Math.round(
              land.scores.reduce((sum, score) => sum + score, 0) /
                land.scores.length
            )
          : 0;
      return {
        landId: land.landId,
        averageHealthScore: avgScore,
        status: this.getOverallStatus(avgScore),
        sectionsCount: land.sections.length,
        sections: land.sections,
      };
    });

    return {
      farmerId: farmerId,
      overallHealthScore: overallHealthScore,
      overallStatus: overallStatus,
      totalSections: results.length,
      landsCount: Object.keys(landsData).length,
      landsBreakdown: landsBreakdown,
    };
  }
}

module.exports = SoilService;

