const cron = require("node-cron");
const logger = require("../config/logger");

/**
 * Cron Job Service
 * Manages scheduled tasks
 */
class CronService {
  static weatherJob = null;
  static isRunning = false;

  /**
   * Generate alert for a farmer
   */
  static async generateAlert(
    farmerId,
    landId,
    section,
    alertType,
    title,
    description
  ) {
    const { Alert } = require("../models");

    const iconMap = {
      irrigation: "irrigation",
      temperature: "temperature",
      rainfall: "rainfall",
      wind: "wind",
    };

    const colorMap = {
      irrigation: "green",
      temperature: "red",
      rainfall: "blue",
      wind: "orange",
    };

    try {
      await Alert.create({
        farmerId,
        landId: landId || null,
        section: section || null,
        alertType,
        title,
        description,
        icon: iconMap[alertType] || null,
        color: colorMap[alertType] || null,
      });
      logger.debug(`Alert created for farmer ${farmerId}: ${title}`);
    } catch (error) {
      logger.error(
        `Error creating alert for farmer ${farmerId}:`,
        error.message
      );
    }
  }

  /**
   * Start weather alert generation cron job
   * Runs daily to fetch 3-day forecast and generate alerts for farmers
   */
  static async startWeatherCronJob() {
    if (this.weatherJob) {
      // Cron job already running, just return status
      logger.debug("Weather cron job is already running");
      return {
        message: "Weather cron job is already running",
        schedule: "Daily at midnight",
      };
    }

    // Get all farmers with lands from database
    const { sequelize } = require("../config/db");
    const { Land, Farmer, SectionSoil } = require("../models");

    const farmersWithLands = await sequelize.query(
      `SELECT DISTINCT f.id as farmer_id, l.id as land_id, l.lat, l.lng
       FROM farmers f
       INNER JOIN lands l ON f.id = l.client_id
       WHERE l.lat IS NOT NULL AND l.lng IS NOT NULL`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (farmersWithLands.length === 0) {
      throw new Error("No farmers with lands found in database");
    }

    // Schedule job to run daily at midnight (00:00)
    // Cron format: "0 0 * * *" = minute 0, hour 0, every day
    this.weatherJob = cron.schedule("0 0 * * *", async () => {
      try {
        logger.info("Starting daily weather alert generation for all farmers");
        this.isRunning = true;

        // Refresh farmers with lands
        const currentFarmersLands = await sequelize.query(
          `SELECT DISTINCT f.id as farmer_id, l.id as land_id, l.lat, l.lng
           FROM farmers f
           INNER JOIN lands l ON f.id = l.client_id
           WHERE l.lat IS NOT NULL AND l.lng IS NOT NULL`,
          {
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (currentFarmersLands.length === 0) {
          logger.warn("No farmers with lands found to process");
          this.isRunning = false;
          return;
        }

        const WeatherService = require("./weather.service");
        let alertsGenerated = 0;
        let errorCount = 0;

        // Process each farmer-land combination
        for (const item of currentFarmersLands) {
          try {
            const { farmer_id, land_id, lat, lng } = item;

            // Fetch 3-day forecast using WeatherService
            const forecastData = await WeatherService.fetchWeatherForecast(
              parseFloat(lat),
              parseFloat(lng)
            );
            const forecastDays = forecastData.forecast?.forecastday || [];

            // Get latest soil data for this farmer/land
            const soilData = await sequelize.query(
              `SELECT section, soil_moisture, ph, electrical_conductivity, organic_carbon
               FROM section_soils
               WHERE client_id = :farmerId AND land_id = :landId
               ORDER BY created_at DESC
               LIMIT 10`,
              {
                replacements: { farmerId: farmer_id, landId: land_id },
                type: sequelize.QueryTypes.SELECT,
              }
            );

            // Process today's forecast (first day)
            if (forecastDays.length > 0) {
              const today = forecastDays[0];
              const todayData = today.day;

              // 1. Check for Irrigation Alert (low soil moisture)
              if (soilData && soilData.length > 0) {
                for (const soil of soilData) {
                  const moisture = soil.soil_moisture
                    ? parseFloat(soil.soil_moisture)
                    : null;
                  if (moisture !== null && moisture < 30) {
                    await this.generateAlert(
                      farmer_id,
                      land_id,
                      soil.section || null,
                      "irrigation",
                      "Irrigation Alert",
                      `Soil moisture is low in ${
                        soil.section ? `sector ${soil.section}` : "your land"
                      } (${moisture.toFixed(
                        1
                      )}%). Immediate irrigation required.`
                    );
                    alertsGenerated++;
                  }
                }
              }

              // 2. Check for Temperature Warning
              const maxTemp = todayData.maxtemp_c
                ? parseFloat(todayData.maxtemp_c)
                : null;
              const minTemp = todayData.mintemp_c
                ? parseFloat(todayData.mintemp_c)
                : null;

              if (maxTemp !== null && maxTemp > 35) {
                await this.generateAlert(
                  farmer_id,
                  land_id,
                  null,
                  "temperature",
                  "Temperature Warning",
                  `High temperature expected today (${maxTemp.toFixed(
                    1
                  )}°C). Take precautions to protect your crops from heat stress.`
                );
                alertsGenerated++;
              } else if (minTemp !== null && minTemp < 0) {
                await this.generateAlert(
                  farmer_id,
                  land_id,
                  null,
                  "temperature",
                  "Temperature Warning",
                  `Low temperature expected today (${minTemp.toFixed(
                    1
                  )}°C). Frost risk - protect sensitive crops.`
                );
                alertsGenerated++;
              }

              // 3. Check for Rainfall Update
              const rainfall = todayData.totalprecip_mm
                ? parseFloat(todayData.totalprecip_mm)
                : 0;
              if (rainfall > 10) {
                await this.generateAlert(
                  farmer_id,
                  land_id,
                  null,
                  "rainfall",
                  "Rainfall Update",
                  `Heavy rainfall expected today (${rainfall.toFixed(
                    1
                  )}mm). Adjust irrigation schedule and monitor for waterlogging.`
                );
                alertsGenerated++;
              } else if (rainfall > 0) {
                await this.generateAlert(
                  farmer_id,
                  land_id,
                  null,
                  "rainfall",
                  "Rainfall Update",
                  `Light rainfall expected today (${rainfall.toFixed(1)}mm).`
                );
                alertsGenerated++;
              }

              // 4. Check for Wind Advisory
              const maxWind = todayData.maxwind_kph
                ? parseFloat(todayData.maxwind_kph)
                : null;
              if (maxWind !== null && maxWind > 30) {
                await this.generateAlert(
                  farmer_id,
                  land_id,
                  null,
                  "wind",
                  "Wind Advisory",
                  `Strong winds expected today (${maxWind.toFixed(
                    1
                  )} km/h). Secure any loose structures or equipment.`
                );
                alertsGenerated++;
              }
            }
          } catch (error) {
            errorCount++;
            logger.error(
              `Error processing alerts for farmer ${item.farmer_id}, land ${item.land_id}:`,
              error.message
            );
          }
        }

        logger.info(
          `Daily weather alert generation completed. Alerts generated: ${alertsGenerated}, Errors: ${errorCount}`
        );
        this.isRunning = false;
      } catch (error) {
        logger.error("Error in weather cron job:", error);
        this.isRunning = false;
      }
    });

    logger.info("Weather cron job started (runs daily at midnight)");
    return {
      message: "Weather cron job started successfully",
      schedule: "Daily at midnight (00:00)",
      farmersCount: farmersWithLands.length,
    };
  }

  /**
   * Stop weather data fetching cron job
   */
  static stopWeatherCronJob() {
    if (!this.weatherJob) {
      throw new Error("Weather cron job is not running");
    }

    this.weatherJob.stop();
    this.weatherJob = null;
    this.isRunning = false;

    logger.info("Weather cron job stopped");
    return {
      message: "Weather cron job stopped successfully",
    };
  }

  /**
   * Get cron job status
   */
  static getStatus() {
    return {
      isRunning: this.weatherJob !== null,
      isExecuting: this.isRunning,
      schedule: this.weatherJob ? "Daily at midnight (00:00)" : null,
    };
  }
}

module.exports = CronService;
