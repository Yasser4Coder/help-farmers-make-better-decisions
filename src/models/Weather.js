const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Weather = sequelize.define('Weather', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  landId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'land_id',
    references: {
      model: 'lands',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'farmers',
      key: 'id'
    }
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  rainfall: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  sunlightSolarRadiation: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'sunlight_solar_radiation'
  },
  sunlightHoursPerDay: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'sunlight_hours_per_day'
  },
  rateOfWaterLoss: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'rate_of_water_loss',
    comment: 'Rate of water loss from soil + plants'
  },
  weatherSeason: {
    type: DataTypes.ENUM('Summer', 'Winter', 'Monsoon'),
    allowNull: true,
    field: 'weather_season'
  },
  frost: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  heatwaves: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  storms: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'weathers',
  timestamps: true,
  underscored: true
});

module.exports = Weather;

