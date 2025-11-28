const { sequelize } = require("../config/db");

// Import all models
const Farmer = require("./Farmer");
const Ing = require("./Ing");
const FarmerIng = require("./FarmerIng");
const Land = require("./Land");
const SectionSoil = require("./SectionSoil");
const CropRec = require("./CropRec");
const CropTable = require("./CropTable");
const CropSectionSoil = require("./CropSectionSoil");
const Weather = require("./Weather");

const db = {
  sequelize,
  Sequelize: require("sequelize"),
  Farmer,
  Ing,
  FarmerIng,
  Land,
  SectionSoil,
  CropRec,
  CropTable,
  CropSectionSoil,
  Weather,
};

// ========== Define Relationships ==========

// 1. Farmer ↔ Ing: Many-to-Many relationship
Farmer.belongsToMany(Ing, {
  through: FarmerIng,
  foreignKey: "farmerId",
  otherKey: "ingId",
  as: "engineers",
});

Ing.belongsToMany(Farmer, {
  through: FarmerIng,
  foreignKey: "ingId",
  otherKey: "farmerId",
  as: "farmers",
});

// 2. Farmer → Land: One-to-Many relationship
Farmer.hasMany(Land, {
  foreignKey: "clientId",
  as: "lands",
});

Land.belongsTo(Farmer, {
  foreignKey: "clientId",
  as: "owner",
});

// 3. Land → SectionSoil: One-to-Many relationship
Land.hasMany(SectionSoil, {
  foreignKey: "landId",
  as: "sectionSoils",
});

SectionSoil.belongsTo(Land, {
  foreignKey: "landId",
  as: "land",
});

// 4. Farmer → SectionSoil: One-to-Many relationship
Farmer.hasMany(SectionSoil, {
  foreignKey: "clientId",
  as: "sectionSoils",
});

SectionSoil.belongsTo(Farmer, {
  foreignKey: "clientId",
  as: "client",
});

// 5. Land → Weather: One-to-Many relationship
Land.hasMany(Weather, {
  foreignKey: "landId",
  as: "weathers",
});

Weather.belongsTo(Land, {
  foreignKey: "landId",
  as: "land",
});

// 6. SectionSoil ↔ CropTable: Many-to-Many relationship
SectionSoil.belongsToMany(CropTable, {
  through: CropSectionSoil,
  foreignKey: "sectionSoilId",
  otherKey: "cropTableId",
  as: "crops",
});

CropTable.belongsToMany(SectionSoil, {
  through: CropSectionSoil,
  foreignKey: "cropTableId",
  otherKey: "sectionSoilId",
  as: "sectionSoils",
});

// 7. CropRec → CropTable: One-to-Many relationship
CropRec.hasMany(CropTable, {
  foreignKey: "cropRecId",
  as: "crops",
});

CropTable.belongsTo(CropRec, {
  foreignKey: "cropRecId",
  as: "cropRec",
});

// 8. Farmer → CropTable: One-to-Many relationship (for clientId)
Farmer.hasMany(CropTable, {
  foreignKey: "clientId",
  as: "cropTables",
});

CropTable.belongsTo(Farmer, {
  foreignKey: "clientId",
  as: "client",
});

// 9. Farmer → Weather: One-to-Many relationship (for clientId)
Farmer.hasMany(Weather, {
  foreignKey: "clientId",
  as: "weathers",
});

Weather.belongsTo(Farmer, {
  foreignKey: "clientId",
  as: "client",
});

module.exports = db;
