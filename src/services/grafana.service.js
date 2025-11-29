const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { sequelize } = require("../config/db");
const { Farmer, Land } = require("../models");

/**
 * Grafana Service
 * Handles Grafana graph URL generation
 */
class GrafanaService {
  // Plot type to panel ID mapping
  static plotTypeMapping = [
    {
      panelId: "panel-2",
      plotType: "time series",
    },
    {
      panelId: "panel-3",
      plotType: "histogram",
    },
  ];

  /**
   * Get panel ID from plot type
   */
  static getPanelIdFromPlotType(plotType) {
    const mapping = this.plotTypeMapping.find(
      (item) => item.plotType.toLowerCase() === plotType.toLowerCase()
    );
    return mapping ? mapping.panelId : "panel-2"; // Default to panel-2
  }

  /**
   * Determine table name based on column
   */
  static getTableFromColumn(column) {
    // Weather columns
    const weatherColumns = [
      "temperature",
      "rainfall",
      "humidity",
      "sunlight_solar_radiation",
      "sunlight_hours_per_day",
      "rate_of_water_loss",
      "weather_season",
      "frost",
      "heatwaves",
      "storms",
    ];

    if (weatherColumns.includes(column.toLowerCase())) {
      return "weathers";
    }

    // Soil columns
    const soilColumns = [
      "soil_moisture",
      "ph",
      "electrical_conductivity",
      "organic_carbon",
      "nitrogen",
      "phosphorus",
      "potassium",
      "soil_type",
    ];

    if (soilColumns.includes(column.toLowerCase())) {
      return "section_soils";
    }

    // Default to weathers
    return "weathers";
  }

  /**
   * Generate Grafana graph URL
   */
  static async generateGraphUrl(farmerId, landId, column, plotType, sectionId = null) {
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

    // Get panel ID from plot type
    const panelId = this.getPanelIdFromPlotType(plotType);

    // Determine table name
    const table = this.getTableFromColumn(column);

    // Generate timestamps (from: 30 days ago, to: now)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Base Grafana URL (should be configurable via env)
    const grafanaBaseUrl =
      process.env.GRAFANA_BASE_URL || "http://localhost:3000";
    const dashboardUid = process.env.GRAFANA_DASHBOARD_UID || "admqj9h";
    const orgId = process.env.GRAFANA_ORG_ID || "1";

    // Build URL with query parameters (matching exact Grafana format)
    const params = [
      `orgId=${orgId}`,
      `from=${thirtyDaysAgo}`,
      `to=${now}`,
      `timezone=browser`,
      `var-query0=`,
      `var-client_id=${farmerId}`,
      `var-query0-2=`,
      `var-land_id=${landId}`,
      `var-query0-3=`,
      `var-section_id=${sectionId || ""}`,
      `var-query0-4=`,
      `var-column=${column}`,
      `var-query0-5=`,
      `var-table=${table}`,
      `theme=light`,
      `panelId=${panelId}`,
      `__feature.dashboardSceneSolo=true`,
    ];

    const queryString = params.join("&");
    const graphUrl = `${grafanaBaseUrl}/d-solo/${dashboardUid}/test?${queryString}`;

    return {
      url: graphUrl,
      iframeUrl: graphUrl,
      farmerId: farmerId,
      landId: landId,
      column: column,
      plotType: plotType,
      panelId: panelId,
      table: table,
      sectionId: sectionId,
      from: thirtyDaysAgo,
      to: now,
    };
  }
}

module.exports = GrafanaService;

