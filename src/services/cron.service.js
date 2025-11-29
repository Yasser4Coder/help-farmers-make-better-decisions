const cron = require("node-cron");
const axios = require("axios");
const logger = require("../config/logger");

/**
 * Cron Job Service
 * Manages scheduled tasks
 */
class CronService {
  static weatherJob = null;
  static isRunning = false;

  /**
   * Start weather data fetching cron job
   * Calls /api/weather/fetch-and-save every 30 minutes for all lands
   */
  static async startWeatherCronJob() {
    if (this.weatherJob) {
      // Cron job already running, just return status
      logger.debug("Weather cron job is already running");
      return {
        message: "Weather cron job is already running",
        schedule: "Every 30 minutes",
      };
    }

    // Get all lands from database
    const { sequelize } = require("../config/db");
    const { Land } = require("../models");

    const lands = await Land.findAll({
      attributes: ["id"],
      raw: true,
    });

    if (lands.length === 0) {
      throw new Error("No lands found in database");
    }

    // Schedule job to run every 30 minutes
    this.weatherJob = cron.schedule("*/30 * * * *", async () => {
      try {
        logger.info("Starting scheduled weather data fetch for all lands");
        this.isRunning = true;

        const { Land } = require("../models");

        // Refresh lands list in case new ones were added
        const currentLands = await Land.findAll({
          attributes: ["id"],
        });

        if (currentLands.length === 0) {
          logger.warn("No lands found to process");
          this.isRunning = false;
          return;
        }

        // Get base URL for internal API calls
        const port = process.env.PORT || 3000;
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
        const apiUrl = `${baseUrl}/api/weather/fetch-and-save`;

        // Fetch weather data for each land via HTTP request to internal endpoint
        let processedCount = 0;
        let errorCount = 0;

        for (const land of currentLands) {
          try {
            // Call the internal /api/weather/fetch-and-save endpoint
            const response = await axios.post(apiUrl, {
              landId: land.id,
            });

            if (response.data.success) {
              processedCount++;
              logger.info(
                `Weather data updated for land ${land.id}: ${response.data.data.saved} records saved`
              );
            } else {
              errorCount++;
              logger.warn(
                `Failed to update weather for land ${land.id}: ${response.data.message}`
              );
            }
          } catch (error) {
            errorCount++;
            const errorMessage =
              error.response?.data?.message || error.message || "Unknown error";
            logger.error(
              `Error fetching weather for land ${land.id}:`,
              errorMessage
            );
          }
        }

        logger.info(
          `Scheduled weather data fetch completed. Processed: ${processedCount}, Errors: ${errorCount}`
        );
        this.isRunning = false;
      } catch (error) {
        logger.error("Error in weather cron job:", error);
        this.isRunning = false;
      }
    });

    logger.info("Weather cron job started (runs every 30 minutes)");
    return {
      message: "Weather cron job started successfully",
      schedule: "Every 30 minutes",
      landsCount: lands.length,
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
      schedule: this.weatherJob ? "Every 30 minutes" : null,
    };
  }
}

module.exports = CronService;
