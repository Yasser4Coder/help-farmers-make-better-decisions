const { sequelize } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");

/**
 * Overview/Dashboard Service
 */
class OverviewService {
  /**
   * Determine weather impact based on weather conditions
   */
  static getWeatherImpact(weatherData) {
    if (!weatherData) return "N/A";

    let score = 0;
    let factors = 0;

    // Temperature check (optimal: 15-30°C)
    if (weatherData.temperature !== null) {
      factors++;
      if (weatherData.temperature >= 15 && weatherData.temperature <= 30) {
        score += 2;
      } else if (
        weatherData.temperature >= 10 &&
        weatherData.temperature < 15
      ) {
        score += 1;
      } else if (
        weatherData.temperature > 30 &&
        weatherData.temperature <= 35
      ) {
        score += 1;
      }
    }

    // Rainfall check (moderate rainfall is good)
    if (weatherData.rainfall !== null) {
      factors++;
      if (weatherData.rainfall >= 5 && weatherData.rainfall <= 50) {
        score += 2; // Good rainfall
      } else if (weatherData.rainfall > 50) {
        score += 0; // Too much rain
      } else {
        score += 1; // Low rain
      }
    }

    // Extreme weather check
    if (weatherData.storms || weatherData.heatwaves || weatherData.frost) {
      score = 0; // Bad if extreme weather
    }

    // Calculate impact
    if (factors === 0) return "N/A";
    const avgScore = score / factors;

    if (avgScore >= 1.5) return "Great";
    if (avgScore >= 0.5) return "Medium";
    return "Bad";
  }

  /**
   * Get location name from coordinates (simplified - using static mapping)
   * In production, you'd use a geocoding service
   */
  static getLocationName(lat, lng) {
    // Static mapping for Algeria cities based on coordinates
    // This is a simplified version - in production, use a geocoding API
    if (!lat || !lng) return "N/A";

    // Approximate coordinates for Algerian cities (from the image: Msila, Setif, Bouira, Alger, Biskra)
    const locations = [
      { name: "alger", lat: 36.75, lng: 3.05 },
      { name: "msila", lat: 35.7, lng: 4.54 },
      { name: "setif", lat: 36.19, lng: 5.41 },
      { name: "bouira", lat: 36.38, lng: 3.9 },
      { name: "biskra", lat: 34.85, lng: 5.73 },
      { name: "Oran", lat: 35.7, lng: -0.62 },
      { name: "Constantine", lat: 36.19, lng: 5.41 },
    ];

    // Find closest location (simplified distance calculation)
    let closest = locations[0];
    let minDist = Math.abs(lat - closest.lat) + Math.abs(lng - closest.lng);

    for (const loc of locations) {
      const dist = Math.abs(lat - loc.lat) + Math.abs(lng - loc.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = loc;
      }
    }

    // If too far, return N/A
    if (minDist > 1.0) return "N/A";
    return closest.name;
  }

  /**
   * Get overview data for an engineer
   */
  static async getOverviewData(engineerId) {
    // Verify engineer exists
    const engineerCheck = await sequelize.query(
      `SELECT id FROM ings WHERE id = :engineerId LIMIT 1`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!engineerCheck || engineerCheck.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
    }

    // Get total farmers count
    const totalFarmersResult = await sequelize.query(
      `SELECT COUNT(DISTINCT f.id) as total
       FROM farmers f
       INNER JOIN farmer_ings fi ON f.id = fi.farmer_id
       WHERE fi.ing_id = :engineerId`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const totalFarmers = totalFarmersResult[0]?.total || 0;

    // Get average soil moisture
    const avgMoistureResult = await sequelize.query(
      `SELECT AVG(ss.soil_moisture) as avg_moisture
       FROM section_soils ss
       INNER JOIN farmers f ON ss.client_id = f.id
       INNER JOIN farmer_ings fi ON f.id = fi.farmer_id
       WHERE fi.ing_id = :engineerId
       AND ss.soil_moisture IS NOT NULL`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const avgSoilMoisture = avgMoistureResult[0]?.avg_moisture
      ? parseFloat(avgMoistureResult[0].avg_moisture).toFixed(1)
      : "0";

    // Get farmers needing attention (low soil moisture < 30% or high > 70%, or bad weather)
    const farmersNeedingAttentionResult = await sequelize.query(
      `SELECT COUNT(DISTINCT f.id) as count
       FROM farmers f
       INNER JOIN farmer_ings fi ON f.id = fi.farmer_id
       LEFT JOIN section_soils ss ON f.id = ss.client_id
       LEFT JOIN lands l ON f.id = l.client_id
       LEFT JOIN weathers w ON l.id = w.land_id AND w.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       WHERE fi.ing_id = :engineerId
       AND (
         ss.soil_moisture < 30 
         OR ss.soil_moisture > 70
         OR w.storms = 1
         OR w.heatwaves = 1
         OR w.frost = 1
       )`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const farmersNeedingAttention =
      farmersNeedingAttentionResult[0]?.count || 0;

    // Get table data: Farmer Name, Crop Type, Soil Moisture, Location, Weather Impact
    // Get one row per farmer-crop combination, or one row per farmer if no crops
    const tableDataResult = await sequelize.query(
      `SELECT 
         f.id as farmer_id,
         f.full_name as farmer_name,
         COALESCE(ct.crop_name, 'N/A') as crop_type,
         COALESCE(
           (SELECT soil_moisture 
            FROM section_soils ss2 
            WHERE ss2.client_id = f.id 
            ORDER BY ss2.created_at DESC 
            LIMIT 1), 
           0
         ) as soil_moisture,
         (SELECT lat FROM lands l2 WHERE l2.client_id = f.id LIMIT 1) as lat,
         (SELECT lng FROM lands l2 WHERE l2.client_id = f.id LIMIT 1) as lng,
         (SELECT temperature FROM weathers w2 
          INNER JOIN lands l3 ON w2.land_id = l3.id 
          WHERE l3.client_id = f.id 
          AND w2.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY w2.time DESC LIMIT 1) as temperature,
         (SELECT rainfall FROM weathers w2 
          INNER JOIN lands l3 ON w2.land_id = l3.id 
          WHERE l3.client_id = f.id 
          AND w2.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY w2.time DESC LIMIT 1) as rainfall,
         (SELECT storms FROM weathers w2 
          INNER JOIN lands l3 ON w2.land_id = l3.id 
          WHERE l3.client_id = f.id 
          AND w2.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY w2.time DESC LIMIT 1) as storms,
         (SELECT heatwaves FROM weathers w2 
          INNER JOIN lands l3 ON w2.land_id = l3.id 
          WHERE l3.client_id = f.id 
          AND w2.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY w2.time DESC LIMIT 1) as heatwaves,
         (SELECT frost FROM weathers w2 
          INNER JOIN lands l3 ON w2.land_id = l3.id 
          WHERE l3.client_id = f.id 
          AND w2.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY w2.time DESC LIMIT 1) as frost
       FROM farmers f
       INNER JOIN farmer_ings fi ON f.id = fi.farmer_id
       LEFT JOIN crop_tables ct ON f.id = ct.client_id AND ct.date_harvested IS NULL
       WHERE fi.ing_id = :engineerId
       GROUP BY f.id, f.full_name, ct.id, ct.crop_name
       ORDER BY f.full_name, ct.crop_name
       LIMIT 50`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Process table data
    const tableData = tableDataResult.map((row) => {
      const location = this.getLocationName(
        row.lat ? parseFloat(row.lat) : null,
        row.lng ? parseFloat(row.lng) : null
      );

      const weatherImpact = this.getWeatherImpact({
        temperature: row.temperature ? parseFloat(row.temperature) : null,
        rainfall: row.rainfall ? parseFloat(row.rainfall) : null,
        storms: row.storms === 1 || row.storms === true,
        heatwaves: row.heatwaves === 1 || row.heatwaves === true,
        frost: row.frost === 1 || row.frost === true,
      });

      return {
        farmerName: row.farmer_name || "N/A",
        cropType: row.crop_type || "N/A",
        soilMoisture:
          row.soil_moisture && row.soil_moisture !== 0
            ? parseFloat(row.soil_moisture).toFixed(1)
            : "0",
        location: location || "N/A",
        weatherImpact: weatherImpact,
      };
    });

    return {
      stats: {
        totalFarmers: parseInt(totalFarmers) || 0,
        farmersNeedingAttention: parseInt(farmersNeedingAttention) || 0,
        averageSoilMoisture: parseFloat(avgSoilMoisture) || 0,
      },
      tableData: tableData,
    };
  }
}

module.exports = OverviewService;
