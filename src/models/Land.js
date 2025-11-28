const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Land = sequelize.define('Land', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  lng: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Longitude'
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitude'
  }
}, {
  tableName: 'lands',
  timestamps: true,
  underscored: true
});

module.exports = Land;

