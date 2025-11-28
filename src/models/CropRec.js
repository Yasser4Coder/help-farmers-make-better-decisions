const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CropRec = sequelize.define(
  "CropRec",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cropName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "crop_name",
      comment: "The target crop to recommend",
    },
    growingSeason: {
      type: DataTypes.ENUM("Kharif", "Rabi", "Summer", "Winter"),
      allowNull: true,
      field: "growing_season",
    },
    plantingHarvestingMonths: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "planting_harvesting_months",
    },
    minTemperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "min_temperature",
    },
    maxTemperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "max_temperature",
    },
    optimalTemperatureRange: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "optimal_temperature_range",
    },
    minRainfall: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "min_rainfall",
    },
    maxRainfall: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "max_rainfall",
    },
    idealRainfallRange: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "ideal_rainfall_range",
    },
    soilTypeRequirements: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "soil_type_requirements",
      comment: "Loamy / Sandy / Clay / Black soil, etc.",
    },
    minPh: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      field: "min_ph",
    },
    maxPh: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      field: "max_ph",
    },
    idealPh: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      field: "ideal_ph",
    },
    nitrogenNeeds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "nitrogen_needs",
    },
    phosphorusNeeds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "phosphorus_needs",
    },
    potassiumNeeds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "potassium_needs",
    },
    waterRequirement: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: true,
      field: "water_requirement",
    },
    irrigationRequirement: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "irrigation_requirement",
    },
    sunlightRequirement: {
      type: DataTypes.ENUM("Full sun", "Partial shade"),
      allowNull: true,
      field: "sunlight_requirement",
    },
    dailySunlightHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "daily_sunlight_hours",
    },
    maturityDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "maturity_duration",
      comment: "Days to harvest",
    },
    pestDiseaseSensitivity: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "pest_disease_sensitivity",
      comment: "Sensitive to humidity, pests, insects",
    },
    expectedYieldPerHectare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "expected_yield_per_hectare",
    },
  },
  {
    tableName: "crop_recs",
    timestamps: true,
    underscored: true,
  }
);

module.exports = CropRec;
