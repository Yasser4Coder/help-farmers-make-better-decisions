const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CropSectionSoil = sequelize.define('CropSectionSoil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sectionSoilId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'section_soil_id',
    references: {
      model: 'section_soils',
      key: 'id'
    }
  },
  cropTableId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'crop_table_id',
    references: {
      model: 'crop_tables',
      key: 'id'
    }
  }
}, {
  tableName: 'crop_section_soils',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['section_soil_id', 'crop_table_id']
    }
  ]
});

module.exports = CropSectionSoil;

