const axios = require("axios");
const { Weather } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const logger = require("../config/logger");

class WeatherService {
  static calculateSunlightHours(sunrise, sunset) {
    try {
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        let hour24 = hours;
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;
        return hour24 + minutes / 60;
      };

      const sunriseHour = parseTime(sunrise);
      const sunsetHour = parseTime(sunset);
      const hours = sunsetHour - sunriseHour;
      return Math.max(0, Math.round(hours * 100) / 100);
    } catch (error) {
      logger.warn("Error calculating sunlight hours:", error);
      return null;
    }
  }

  static determineSeason(date) {
    const month = new Date(date).getMonth() + 1;
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 12 || month <= 2) return "Winter";
    return "Monsoon";
  }

  static checkExtremeWeather(dayData) {
    const frost = dayData.mintemp_c < 0;
    const heatwave = dayData.maxtemp_c > 35;
    const storm = dayData.maxwind_kph > 50 || dayData.totalprecip_mm > 10;

    return { frost, heatwaves: heatwave, storms: storm };
  }

  static async fetchWeatherData(lat, lng, startDate, endDate) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Weather API key is not configured"
      );
    }

    const baseUrl = "https://api.weatherapi.com/v1/history.json";
    const location = `${lat},${lng}`;

    try {
      const response = await axios.get(baseUrl, {
        params: {
          key: apiKey,
          q: location,
          dt: startDate,
          end_dt: endDate,
        },
      });

      return response.data;
    } catch (error) {
      logger.error("Weather API error:", error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid date range or location for weather API"
        );
      }
      if (error.response?.status === 401) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Weather API key");
      }
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Weather API service unavailable"
      );
    }
  }

  /**
   * Fetch 3-day weather forecast from WeatherAPI
   */
  static async fetchWeatherForecast(lat, lng) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Weather API key is not configured"
      );
    }

    const baseUrl = "https://api.weatherapi.com/v1/forecast.json";
    const location = `${lat},${lng}`;

    try {
      const response = await axios.get(baseUrl, {
        params: {
          key: apiKey,
          q: location,
          days: 3,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(
        "Weather Forecast API error:",
        error.response?.data || error.message
      );
      if (error.response?.status === 400) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid location for weather forecast API"
        );
      }
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Weather API service unavailable"
      );
    }
  }

  static async saveWeatherData(landId, clientId, lat, lng, startDate, endDate) {
    if (!landId || !clientId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "landId and clientId are required"
      );
    }

    const apiData = await this.fetchWeatherData(lat, lng, startDate, endDate);

    if (!apiData.forecast || !apiData.forecast.forecastday) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No weather data available for the specified date range"
      );
    }

    const savedRecords = [];
    const errors = [];

    for (const forecastDay of apiData.forecast.forecastday) {
      try {
        const dayData = forecastDay.day;
        const astroData = forecastDay.astro;
        const date = forecastDay.date;

        const sunlightHours = this.calculateSunlightHours(
          astroData.sunrise,
          astroData.sunset
        );

        const season = this.determineSeason(date);

        const extremeWeather = this.checkExtremeWeather(dayData);

        const rateOfWaterLoss =
          dayData.avgtemp_c > 0
            ? (dayData.avgtemp_c * dayData.avghumidity) / 100
            : 0;

        const weatherDate = new Date(date);
        weatherDate.setHours(12, 0, 0, 0);

        const { sequelize } = require("../config/db");

        const existingRecords = await sequelize.query(
          `SELECT id FROM weathers 
           WHERE land_id = :landId 
           AND client_id = :clientId 
           AND (
             DATE(time) = DATE(:date) 
             OR (time IS NULL AND DATE(created_at) = DATE(:date))
           )
           LIMIT 1`,
          {
            replacements: { landId, clientId, date },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        // Always update existing record if found, otherwise create new one
        if (existingRecords.length > 0) {
          // Update existing record using raw query for better performance
          const existingId = existingRecords[0].id;
          await sequelize.query(
            `UPDATE weathers 
             SET 
               time = :time,
               temperature = :temperature,
               rainfall = :rainfall,
               humidity = :humidity,
               sunlight_solar_radiation = :sunlightSolarRadiation,
               sunlight_hours_per_day = :sunlightHoursPerDay,
               rate_of_water_loss = :rateOfWaterLoss,
               weather_season = :weatherSeason,
               frost = :frost,
               heatwaves = :heatwaves,
               storms = :storms,
               updated_at = NOW()
             WHERE id = :id`,
            {
              replacements: {
                id: existingId,
                time: weatherDate,
                temperature: dayData.avgtemp_c || null,
                rainfall: dayData.totalprecip_mm || null,
                humidity: dayData.avghumidity || null,
                sunlightSolarRadiation: dayData.uv || null,
                sunlightHoursPerDay: sunlightHours,
                rateOfWaterLoss: rateOfWaterLoss || null,
                weatherSeason: season,
                frost: extremeWeather.frost,
                heatwaves: extremeWeather.heatwaves,
                storms: extremeWeather.storms,
              },
            }
          );
          savedRecords.push({ date, action: "updated", id: existingId });
        } else {
          // Create new record
          const weatherRecord = await Weather.create({
            landId,
            clientId,
            time: weatherDate,
            temperature: dayData.avgtemp_c || null,
            rainfall: dayData.totalprecip_mm || null,
            humidity: dayData.avghumidity || null,
            sunlightSolarRadiation: dayData.uv || null,
            sunlightHoursPerDay: sunlightHours,
            rateOfWaterLoss: rateOfWaterLoss || null,
            weatherSeason: season,
            frost: extremeWeather.frost,
            heatwaves: extremeWeather.heatwaves,
            storms: extremeWeather.storms,
          });
          savedRecords.push({ date, action: "created", id: weatherRecord.id });
        }
      } catch (error) {
        logger.error(
          `Error processing weather data for date ${forecastDay.date}:`,
          error
        );
        errors.push({ date: forecastDay.date, error: error.message });
      }
    }

    return {
      totalDays: apiData.forecast.forecastday.length,
      saved: savedRecords.length,
      errors: errors.length,
      records: savedRecords,
      errorDetails: errors,
    };
  }

  /**
   * Get overall weather status for a specific farmer
   * Returns aggregated weather data across all their lands
   */
  static async getWeatherStatusByFarmer(farmerId) {
    const { sequelize } = require("../config/db");
    const { Farmer, Land } = require("../models");
    const OverviewService = require("./overview.service");

    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Get all weather records for this farmer (last 7 days, grouped by land)
    const results = await sequelize.query(
      `SELECT 
         w.id,
         w.land_id,
         w.time,
         w.temperature,
         w.rainfall,
         w.humidity,
         w.sunlight_solar_radiation,
         w.sunlight_hours_per_day,
         w.rate_of_water_loss,
         w.weather_season,
         w.frost,
         w.heatwaves,
         w.storms,
         l.lat,
         l.lng
       FROM weathers w
       INNER JOIN lands l ON w.land_id = l.id
       WHERE w.client_id = :farmerId
       AND w.time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY w.land_id, w.time DESC`,
      {
        replacements: { farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "No weather data found for this farmer in the last 7 days"
      );
    }

    // Group weather data by land
    const landsData = {};

    for (const row of results) {
      const landId = row.land_id;
      if (!landsData[landId]) {
        landsData[landId] = {
          landId: landId,
          lat: row.lat ? parseFloat(row.lat) : null,
          lng: row.lng ? parseFloat(row.lng) : null,
          records: [],
          temperatures: [],
          rainfalls: [],
          humidities: [],
          impacts: [],
        };
      }

      const weatherRecord = {
        time: row.time,
        temperature: row.temperature ? parseFloat(row.temperature) : null,
        rainfall: row.rainfall ? parseFloat(row.rainfall) : null,
        humidity: row.humidity ? parseFloat(row.humidity) : null,
        sunlightSolarRadiation: row.sunlight_solar_radiation
          ? parseFloat(row.sunlight_solar_radiation)
          : null,
        sunlightHoursPerDay: row.sunlight_hours_per_day
          ? parseFloat(row.sunlight_hours_per_day)
          : null,
        frost: row.frost === 1 || row.frost === true,
        heatwaves: row.heatwaves === 1 || row.heatwaves === true,
        storms: row.storms === 1 || row.storms === true,
      };

      landsData[landId].records.push(weatherRecord);
      if (weatherRecord.temperature !== null)
        landsData[landId].temperatures.push(weatherRecord.temperature);
      if (weatherRecord.rainfall !== null)
        landsData[landId].rainfalls.push(weatherRecord.rainfall);
      if (weatherRecord.humidity !== null)
        landsData[landId].humidities.push(weatherRecord.humidity);

      // Calculate weather impact for each day
      const impact = OverviewService.getWeatherImpact(weatherRecord);
      landsData[landId].impacts.push(impact);
    }

    // Calculate averages and overall status per land
    const landsBreakdown = [];
    let overallImpacts = [];

    for (const [landId, landData] of Object.entries(landsData)) {
      const avgTemperature =
        landData.temperatures.length > 0
          ? parseFloat(
              (
                landData.temperatures.reduce((a, b) => a + b, 0) /
                landData.temperatures.length
              ).toFixed(1)
            )
          : null;

      const totalRainfall =
        landData.rainfalls.length > 0
          ? parseFloat(landData.rainfalls.reduce((a, b) => a + b, 0).toFixed(2))
          : 0;

      const avgHumidity =
        landData.humidities.length > 0
          ? parseFloat(
              (
                landData.humidities.reduce((a, b) => a + b, 0) /
                landData.humidities.length
              ).toFixed(1)
            )
          : null;

      // Determine overall weather status for this land (most common impact)
      const impactCounts = landData.impacts.reduce((acc, impact) => {
        acc[impact] = (acc[impact] || 0) + 1;
        return acc;
      }, {});
      const dominantImpact = Object.keys(impactCounts).reduce((a, b) =>
        impactCounts[a] > impactCounts[b] ? a : b
      );

      // Count extreme weather days
      const extremeWeatherDays = landData.records.filter(
        (r) => r.frost || r.heatwaves || r.storms
      ).length;

      const latestRecord = landData.records[0]; // Already sorted DESC

      const location = OverviewService.getLocationName(
        landData.lat,
        landData.lng
      );

      landsBreakdown.push({
        landId: parseInt(landId),
        location: location,
        averageTemperature: avgTemperature,
        totalRainfall: totalRainfall,
        averageHumidity: avgHumidity,
        weatherStatus: dominantImpact,
        extremeWeatherDays: extremeWeatherDays,
        totalDays: landData.records.length,
        latestWeather: {
          date: latestRecord.time,
          temperature: latestRecord.temperature,
          rainfall: latestRecord.rainfall,
          humidity: latestRecord.humidity,
          impact: OverviewService.getWeatherImpact(latestRecord),
        },
      });

      overallImpacts = overallImpacts.concat(landData.impacts);
    }

    // Determine overall weather status (most common impact across all lands)
    const overallImpactCounts = overallImpacts.reduce((acc, impact) => {
      acc[impact] = (acc[impact] || 0) + 1;
      return acc;
    }, {});
    const overallWeatherStatus =
      Object.keys(overallImpactCounts).length > 0
        ? Object.keys(overallImpactCounts).reduce((a, b) =>
            overallImpactCounts[a] > overallImpactCounts[b] ? a : b
          )
        : "N/A";

    // Calculate overall averages
    const allTemperatures = Object.values(landsData)
      .flatMap((land) => land.temperatures)
      .filter((t) => t !== null);
    const allRainfalls = Object.values(landsData)
      .flatMap((land) => land.rainfalls)
      .filter((r) => r !== null);
    const allHumidities = Object.values(landsData)
      .flatMap((land) => land.humidities)
      .filter((h) => h !== null);

    const overallAverageTemperature =
      allTemperatures.length > 0
        ? parseFloat(
            (
              allTemperatures.reduce((a, b) => a + b, 0) /
              allTemperatures.length
            ).toFixed(1)
          )
        : null;

    const overallTotalRainfall =
      allRainfalls.length > 0
        ? parseFloat(allRainfalls.reduce((a, b) => a + b, 0).toFixed(2))
        : 0;

    const overallAverageHumidity =
      allHumidities.length > 0
        ? parseFloat(
            (
              allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length
            ).toFixed(1)
          )
        : null;

    return {
      farmerId: farmerId,
      overallWeatherStatus: overallWeatherStatus,
      overallAverageTemperature: overallAverageTemperature,
      overallTotalRainfall: overallTotalRainfall,
      overallAverageHumidity: overallAverageHumidity,
      totalDaysAnalyzed: results.length,
      landsCount: Object.keys(landsData).length,
      landsBreakdown: landsBreakdown,
    };
  }
}

module.exports = WeatherService;
