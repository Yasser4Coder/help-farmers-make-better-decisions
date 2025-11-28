const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SectionSoil = sequelize.define(
  "SectionSoil",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "client_id",
      references: {
        model: "farmers",
        key: "id",
      },
    },
    landId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "land_id",
      references: {
        model: "lands",
        key: "id",
      },
    },
    nitrogen: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Nitrogen (N)",
    },
    phosphorus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Phosphorus (P)",
    },
    potassium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Potassium (K)",
    },
    ph: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: "pH level",
    },
    soilType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "soil_type",
    },
    soilMoisture: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "soil_moisture",
    },
    organicCarbon: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "organic_carbon",
    },
    electricalConductivity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "electrical_conductivity",
      comment: "Salinity",
    },
    microNutrients: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "micro_nutrients",
    },
    lng: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: "Longitude",
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: "Latitude",
    },
    section: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "section_soils",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SectionSoil;
