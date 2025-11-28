const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FarmerIng = sequelize.define('FarmerIng', {
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
  ingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ing_id',
    references: {
      model: 'ings',
      key: 'id'
    }
  }
}, {
  tableName: 'farmer_ings',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['farmer_id', 'ing_id']
    }
  ]
});

module.exports = FarmerIng;

