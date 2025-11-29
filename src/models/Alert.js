const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'farmer_id',
    references: {
      model: 'farmers',
      key: 'id'
    }
  },
  landId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'land_id',
    references: {
      model: 'lands',
      key: 'id'
    }
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alertType: {
    type: DataTypes.ENUM('irrigation', 'temperature', 'rainfall', 'wind'),
    allowNull: false,
    field: 'alert_type'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon identifier: irrigation, temperature, rainfall, wind'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Color for UI: green, red, blue, orange'
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  underscored: true
});

module.exports = Alert;

