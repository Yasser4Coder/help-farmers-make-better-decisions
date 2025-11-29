const { Alert, Farmer, Land } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { Op } = require("sequelize");

/**
 * Alert Service
 * Handles alert retrieval and management
 */
class AlertService {
  /**
   * Get alerts for a farmer
   * @param {number} farmerId - Farmer ID
   * @param {object} filters - Optional filters (alertType, landId, limit, offset)
   */
  static async getAlertsByFarmer(farmerId, filters = {}) {
    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Build where clause
    const whereClause = {
      farmerId: farmerId,
    };

    // Filter by alert type
    if (filters.alertType) {
      whereClause.alertType = filters.alertType;
    }

    // Filter by land ID
    if (filters.landId) {
      whereClause.landId = filters.landId;
    }

    // Pagination
    const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
    const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

    // Get alerts with pagination, ordered by most recent first
    const { count, rows: alerts } = await Alert.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Land,
          as: "land",
          attributes: ["id", "lat", "lng"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit > 0 ? limit : 50,
      offset: offset >= 0 ? offset : 0,
    });

    // Format alerts for response
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      farmerId: alert.farmerId,
      landId: alert.landId,
      section: alert.section,
      alertType: alert.alertType,
      title: alert.title,
      description: alert.description,
      icon: alert.icon,
      color: alert.color,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      land: alert.land
        ? {
            id: alert.land.id,
            lat: alert.land.lat,
            lng: alert.land.lng,
          }
        : null,
    }));

    return {
      alerts: formattedAlerts,
      total: count,
      limit: limit,
      offset: offset,
      hasMore: offset + limit < count,
    };
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(alertId, farmerId = null) {
    const whereClause = {
      id: alertId,
    };

    // If farmerId is provided, ensure the alert belongs to that farmer
    if (farmerId) {
      whereClause.farmerId = farmerId;
    }

    const alert = await Alert.findOne({
      where: whereClause,
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: ["id", "fullName", "email"],
          required: false,
        },
        {
          model: Land,
          as: "land",
          attributes: ["id", "lat", "lng"],
          required: false,
        },
      ],
    });

    if (!alert) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Alert not found");
    }

    return {
      id: alert.id,
      farmerId: alert.farmerId,
      landId: alert.landId,
      section: alert.section,
      alertType: alert.alertType,
      title: alert.title,
      description: alert.description,
      icon: alert.icon,
      color: alert.color,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      farmer: alert.farmer
        ? {
            id: alert.farmer.id,
            fullName: alert.farmer.fullName,
            email: alert.farmer.email,
          }
        : null,
      land: alert.land
        ? {
            id: alert.land.id,
            lat: alert.land.lat,
            lng: alert.land.lng,
          }
        : null,
    };
  }
}

module.exports = AlertService;

