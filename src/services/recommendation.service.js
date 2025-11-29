const { CropRec, Weather, Land, SectionSoil, CropTable } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { sequelize } = require("../config/db");

/**
 * Recommendation Service
 * Content-based crop recommendation using cosine similarity
 */
class RecommendationService {
  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Normalize a value to 0-1 range based on min/max
   */
  static normalize(value, min, max) {
    if (value === null || value === undefined || min === null || max === null) {
      return 0;
    }
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  }

  /**
   * Convert categorical values to numeric
   */
  static categoricalToNumeric(value, options = []) {
    if (!value) return 0;
    const index = options.indexOf(value);
    return index >= 0 ? (index + 1) / options.length : 0;
  }

  /**
   * Get land profile data (weather + soil data) for a specific land
   */
  static async getLandProfile(farmerId, landId) {
    // Get weather data (average/range from last 3 months)
    const weatherData = await sequelize.query(
      `SELECT 
         AVG(temperature) as avg_temperature,
         MIN(temperature) as min_temperature,
         MAX(temperature) as max_temperature,
         AVG(rainfall) as avg_rainfall,
         SUM(rainfall) as total_rainfall,
         MIN(rainfall) as min_rainfall,
         MAX(rainfall) as max_rainfall,
         AVG(sunlight_hours_per_day) as avg_sunlight_hours,
         MIN(sunlight_hours_per_day) as min_sunlight_hours,
         MAX(sunlight_hours_per_day) as max_sunlight_hours,
         MAX(CASE WHEN frost = 1 THEN 1 ELSE 0 END) as has_frost,
         MAX(CASE WHEN heatwaves = 1 THEN 1 ELSE 0 END) as has_heatwaves
       FROM weathers
       WHERE land_id = :landId 
       AND client_id = :farmerId
       AND time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
       GROUP BY land_id`,
      {
        replacements: { landId, farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get latest soil data
    const soilData = await sequelize.query(
      `SELECT 
         AVG(ph) as avg_ph,
         MIN(ph) as min_ph,
         MAX(ph) as max_ph,
         AVG(nitrogen) as avg_nitrogen,
         AVG(phosphorus) as avg_phosphorus,
         AVG(potassium) as avg_potassium,
         MAX(soil_type) as soil_type
       FROM section_soils
       WHERE land_id = :landId 
       AND client_id = :farmerId
       GROUP BY land_id`,
      {
        replacements: { landId, farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const weather = weatherData[0] || {};
    const soil = soilData[0] || {};

    // Build profile matching crop_recs structure
    const profile = {
      minTemperature: weather.min_temperature
        ? parseFloat(weather.min_temperature)
        : null,
      maxTemperature: weather.max_temperature
        ? parseFloat(weather.max_temperature)
        : null,
      minRainfall: weather.min_rainfall ? parseFloat(weather.min_rainfall) : null,
      maxRainfall: weather.max_rainfall
        ? parseFloat(weather.max_rainfall)
        : null,
      minPh: soil.min_ph ? parseFloat(soil.min_ph) : null,
      maxPh: soil.max_ph ? parseFloat(soil.max_ph) : null,
      idealPh: soil.avg_ph ? parseFloat(soil.avg_ph) : null,
      nitrogenNeeds: soil.avg_nitrogen
        ? parseFloat(soil.avg_nitrogen)
        : null,
      phosphorusNeeds: soil.avg_phosphorus
        ? parseFloat(soil.avg_phosphorus)
        : null,
      potassiumNeeds: soil.avg_potassium
        ? parseFloat(soil.avg_potassium)
        : null,
      dailySunlightHours: weather.avg_sunlight_hours
        ? parseFloat(weather.avg_sunlight_hours)
        : null,
      soilTypeRequirements: soil.soil_type || null,
      waterRequirement: null, // Will be calculated based on rainfall
      growingSeason: this.determineSeason(),
    };

    // Determine water requirement based on rainfall
    if (weather.avg_rainfall !== null && weather.avg_rainfall !== undefined) {
      const avgRainfall = parseFloat(weather.avg_rainfall);
      if (avgRainfall < 400) {
        profile.waterRequirement = "High";
      } else if (avgRainfall < 800) {
        profile.waterRequirement = "Medium";
      } else {
        profile.waterRequirement = "Low";
      }
    }

    return profile;
  }

  /**
   * Determine current season based on month
   */
  static determineSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return "Summer";
    if (month >= 6 && month <= 8) return "Monsoon";
    if (month >= 9 && month <= 11) return "Winter";
    return "Winter"; // Dec, Jan, Feb
  }

  /**
   * Convert profile/crop_rec to feature vector for cosine similarity
   */
  static toFeatureVector(data) {
    const vector = [];

    // Normalize numeric features
    // Temperature (0-50°C range)
    vector.push(
      this.normalize(data.minTemperature, 0, 50),
      this.normalize(data.maxTemperature, 0, 50)
    );

    // Rainfall (0-2000mm range)
    vector.push(
      this.normalize(data.minRainfall, 0, 2000),
      this.normalize(data.maxRainfall, 0, 2000)
    );

    // pH (4-9 range)
    vector.push(
      this.normalize(data.minPh, 4, 9),
      this.normalize(data.maxPh, 4, 9),
      this.normalize(data.idealPh, 4, 9)
    );

    // Nutrients (0-200 mg/kg range)
    vector.push(
      this.normalize(data.nitrogenNeeds, 0, 200),
      this.normalize(data.phosphorusNeeds, 0, 200),
      this.normalize(data.potassiumNeeds, 0, 200)
    );

    // Sunlight hours (0-16 hours range)
    vector.push(this.normalize(data.dailySunlightHours, 0, 16));

    // Water requirement (categorical: Low=0.33, Medium=0.66, High=1.0)
    const waterReqMap = { Low: 0.33, Medium: 0.66, High: 1.0 };
    vector.push(waterReqMap[data.waterRequirement] || 0);

    // Season (categorical)
    const seasons = ["Kharif", "Rabi", "Summer", "Winter"];
    vector.push(
      this.categoricalToNumeric(data.growingSeason, seasons)
    );

    // Soil type (simplified - treat as numeric based on common types)
    const soilTypes = ["Loamy", "Sandy", "Clay", "Black", "Red", "Alluvial"];
    vector.push(this.categoricalToNumeric(data.soilTypeRequirements, soilTypes));

    return vector;
  }

  /**
   * Get crop recommendations based on land profile
   */
  static async getCropRecommendations(farmerId, landId) {
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

    // Get land profile
    const landProfile = await this.getLandProfile(farmerId, landId);

    // Check if we have enough data
    const hasMinimalData =
      (landProfile.minTemperature !== null &&
        landProfile.maxTemperature !== null) ||
      landProfile.avgRainfall !== null ||
      landProfile.minPh !== null;

    if (!hasMinimalData) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Insufficient data for recommendations. Need at least weather or soil data."
      );
    }

    // Get all crop recommendations
    const cropRecs = await CropRec.findAll({
      raw: true,
    });

    if (cropRecs.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "No crop recommendations available in database"
      );
    }

    // Convert land profile to feature vector
    const landVector = this.toFeatureVector(landProfile);

    // Calculate similarity for each crop
    const similarities = [];

    for (const cropRec of cropRecs) {
      const cropVector = this.toFeatureVector({
        minTemperature: cropRec.min_temperature,
        maxTemperature: cropRec.max_temperature,
        minRainfall: cropRec.min_rainfall,
        maxRainfall: cropRec.max_rainfall,
        minPh: cropRec.min_ph,
        maxPh: cropRec.max_ph,
        idealPh: cropRec.ideal_ph,
        nitrogenNeeds: cropRec.nitrogen_needs,
        phosphorusNeeds: cropRec.phosphorus_needs,
        potassiumNeeds: cropRec.potassium_needs,
        dailySunlightHours: cropRec.daily_sunlight_hours,
        waterRequirement: cropRec.water_requirement,
        growingSeason: cropRec.growing_season,
        soilTypeRequirements: cropRec.soil_type_requirements,
      });

      const similarity = this.cosineSimilarity(landVector, cropVector);

      similarities.push({
        cropRecId: cropRec.id,
        cropName: cropRec.crop_name,
        similarity: similarity,
        cropData: {
          growingSeason: cropRec.growing_season,
          minTemperature: cropRec.min_temperature,
          maxTemperature: cropRec.max_temperature,
          minRainfall: cropRec.min_rainfall,
          maxRainfall: cropRec.max_rainfall,
          soilTypeRequirements: cropRec.soil_type_requirements,
          minPh: cropRec.min_ph,
          maxPh: cropRec.max_ph,
          idealPh: cropRec.ideal_ph,
          waterRequirement: cropRec.water_requirement,
          dailySunlightHours: cropRec.daily_sunlight_hours,
          maturityDuration: cropRec.maturity_duration,
          expectedYieldPerHectare: cropRec.expected_yield_per_hectare,
        },
      });
    }

    // Sort by similarity (highest first) and get top 3
    similarities.sort((a, b) => b.similarity - a.similarity);
    const top3 = similarities.slice(0, 3);

    return {
      landProfile: landProfile,
      recommendations: top3.map((item, index) => ({
        rank: index + 1,
        cropRecId: item.cropRecId,
        cropName: item.cropName,
        similarityScore: parseFloat(item.similarity.toFixed(4)),
        similarityPercentage: parseFloat((item.similarity * 100).toFixed(2)),
        cropData: item.cropData,
      })),
    };
  }
}

module.exports = RecommendationService;

