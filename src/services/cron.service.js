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
   * Generate alerts for all farmers (can be called manually or by cron)
   */
  static async generateAlertsForAllFarmers() {
    const { sequelize } = require("../config/db");

    // Get all farmers with lands from database
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
      logger.warn("No farmers with lands found to process");
      return {
        alertsGenerated: 0,
        errorCount: 0,
        farmersProcessed: 0,
        message: "No farmers with lands found",
      };
    }

    const WeatherService = require("./weather.service");
    let alertsGenerated = 0;
    let errorCount = 0;

    logger.info(
      `Starting alert generation for ${farmersWithLands.length} farmer-land combinations`
    );

    // Process each farmer-land combination
    for (const item of farmersWithLands) {
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

        logger.debug(
          `Processing farmer ${farmer_id}, land ${land_id}: ${soilData.length} soil records found, ${forecastDays.length} forecast days`
        );

        // 1. Check for Irrigation Alert (low soil moisture) - Only check once, not per day
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
                } (${moisture.toFixed(1)}%). Immediate irrigation required.`
              );
              alertsGenerated++;
            }
          }
        } else {
          logger.debug(
            `No soil data found for farmer ${farmer_id}, land ${land_id}`
          );
        }

        // 2. Process all 3 days of forecast
        if (forecastDays.length === 0) {
          logger.warn(
            `No forecast data received for farmer ${farmer_id}, land ${land_id}`
          );
        } else {
          // Process each day of the 3-day forecast
          for (let dayIndex = 0; dayIndex < forecastDays.length; dayIndex++) {
            const forecastDay = forecastDays[dayIndex];
            const dayData = forecastDay.day;
            const forecastDate = new Date(forecastDay.date);

            // Get day name for alert description
            const dayNames = ["Today", "Tomorrow", "Day 3"];
            const dayLabel = dayNames[dayIndex] || `Day ${dayIndex + 1}`;
            const dateLabel = forecastDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            // Check for Temperature Warning
            const maxTemp = dayData.maxtemp_c
              ? parseFloat(dayData.maxtemp_c)
              : null;
            const minTemp = dayData.mintemp_c
              ? parseFloat(dayData.mintemp_c)
              : null;

            if (maxTemp !== null && maxTemp > 35) {
              await this.generateAlert(
                farmer_id,
                land_id,
                null,
                "temperature",
                "Temperature Warning",
                `High temperature expected on ${dayLabel} (${dateLabel}): ${maxTemp.toFixed(
                  1
                )}°C. Take precautions to protect your crops from heat stress.`
              );
              alertsGenerated++;
            } else if (minTemp !== null && minTemp < 0) {
              await this.generateAlert(
                farmer_id,
                land_id,
                null,
                "temperature",
                "Temperature Warning",
                `Low temperature expected on ${dayLabel} (${dateLabel}): ${minTemp.toFixed(
                  1
                )}°C. Frost risk - protect sensitive crops.`
              );
              alertsGenerated++;
            }

            // Check for Rainfall Update
            const rainfall = dayData.totalprecip_mm
              ? parseFloat(dayData.totalprecip_mm)
              : 0;
            if (rainfall > 10) {
              await this.generateAlert(
                farmer_id,
                land_id,
                null,
                "rainfall",
                "Rainfall Update",
                `Heavy rainfall expected on ${dayLabel} (${dateLabel}): ${rainfall.toFixed(
                  1
                )}mm. Adjust irrigation schedule and monitor for waterlogging.`
              );
              alertsGenerated++;
            } else if (rainfall > 0) {
              await this.generateAlert(
                farmer_id,
                land_id,
                null,
                "rainfall",
                "Rainfall Update",
                `Light rainfall expected on ${dayLabel} (${dateLabel}): ${rainfall.toFixed(
                  1
                )}mm.`
              );
              alertsGenerated++;
            }

            // Check for Wind Advisory
            const maxWind = dayData.maxwind_kph
              ? parseFloat(dayData.maxwind_kph)
              : null;
            if (maxWind !== null && maxWind > 30) {
              await this.generateAlert(
                farmer_id,
                land_id,
                null,
                "wind",
                "Wind Advisory",
                `Strong winds expected on ${dayLabel} (${dateLabel}): ${maxWind.toFixed(
                  1
                )} km/h. Secure any loose structures or equipment.`
              );
              alertsGenerated++;
            }
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
      `Alert generation completed. Alerts generated: ${alertsGenerated}, Errors: ${errorCount}`
    );

    return {
      alertsGenerated,
      errorCount,
      farmersProcessed: farmersWithLands.length,
      message: `Generated ${alertsGenerated} alerts for ${farmersWithLands.length} farmer-land combinations`,
    };
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
        await this.generateAlertsForAllFarmers();
        this.isRunning = false;
      } catch (error) {
        logger.error("Error in weather cron job:", error);
        this.isRunning = false;
      }
    });

    // Also run immediately on start (for testing)
    // Comment out if you don't want immediate execution
    try {
      logger.info("Running initial alert generation...");
      this.generateAlertsForAllFarmers().catch((error) => {
        logger.error("Error in initial alert generation:", error);
      });
    } catch (error) {
      logger.error("Error starting initial alert generation:", error);
    }

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
