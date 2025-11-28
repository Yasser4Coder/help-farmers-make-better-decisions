const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CropTable = sequelize.define('CropTable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cropRecId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'crop_rec_id',
    references: {
      model: 'crop_recs',
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
  cropName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'crop_name'
  },
  datePlanted: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_planted'
  },
  dateHarvested: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_harvested'
  }
}, {
  tableName: 'crop_tables',
  timestamps: true,
  underscored: true
});

module.exports = CropTable;

