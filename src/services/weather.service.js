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

        const existing =
          existingRecords.length > 0
            ? await Weather.findByPk(existingRecords[0].id)
            : null;

        if (existing) {
          await existing.update({
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

          savedRecords.push({ date, action: "updated", id: existing.id });
        } else {
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
}

module.exports = WeatherService;
