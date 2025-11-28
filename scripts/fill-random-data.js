/**
 * Script to fill database with random data
 * Run with: node scripts/fill-random-data.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { sequelize } = require("../src/config/db");
const {
  Farmer,
  Land,
  SectionSoil,
  CropRec,
  CropTable,
  CropSectionSoil,
} = require("../src/models");

// Helper function to get random value from array
const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const randomFloat = (min, max, decimals = 2) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Crop names
const cropNames = [
  "Wheat",
  "Barley",
  "Corn",
  "Rice",
  "Tomatoes",
  "Potatoes",
  "Onions",
  "Carrots",
  "Lettuce",
  "Cucumbers",
  "Peppers",
  "Beans",
  "Peas",
  "Sunflower",
  "Cotton",
  "Soybeans",
  "Lentils",
  "Chickpeas",
];

// Soil types
const soilTypes = ["Loamy", "Sandy", "Clay", "Black", "Red", "Alluvial"];

// Growing seasons
const seasons = ["Kharif", "Rabi", "Summer", "Winter"];

// Water requirements
const waterReqs = ["Low", "Medium", "High"];

// Sunlight requirements
const sunlightReqs = ["Full sun", "Partial shade"];

// Sections (for section_soils)
const sections = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

const fillRandomData = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established.\n");

    // Get existing farmers and lands
    const farmers = await Farmer.findAll({ limit: 10 });
    const lands = await Land.findAll({ limit: 10 });

    if (farmers.length === 0) {
      console.log("❌ No farmers found. Please create farmers first.");
      process.exit(1);
    }

    if (lands.length === 0) {
      console.log("❌ No lands found. Please create lands first.");
      process.exit(1);
    }

    console.log(`📊 Found ${farmers.length} farmer(s) and ${lands.length} land(s)\n`);

    // ========== 1. Fill section_soils ==========
    console.log("🌱 Filling section_soils table...");
    const sectionSoilsCreated = [];

    for (let i = 0; i < 20; i++) {
      const farmer = randomFromArray(farmers);
      const land = randomFromArray(lands.filter((l) => l.clientId === farmer.id));
      if (!land) continue; // Skip if no land for this farmer

      const section = randomFromArray(sections);

      try {
        const sectionSoil = await SectionSoil.create({
          clientId: farmer.id,
          landId: land.id,
          section: section,
          nitrogen: randomFloat(10, 50),
          phosphorus: randomFloat(5, 30),
          potassium: randomFloat(100, 300),
          ph: randomFloat(5.5, 8.0),
          soilType: randomFromArray(soilTypes),
          soilMoisture: randomFloat(20, 70),
          organicCarbon: randomFloat(0.5, 4.0),
          electricalConductivity: randomFloat(0.5, 3.0),
          microNutrients: JSON.stringify({
            zinc: randomFloat(0.5, 5.0),
            iron: randomFloat(2.0, 15.0),
            manganese: randomFloat(5.0, 50.0),
          }),
          lat: land.lat || randomFloat(35.0, 37.0),
          lng: land.lng || randomFloat(-1.0, 6.0),
        });
        sectionSoilsCreated.push(sectionSoil);
      } catch (error) {
        // Skip duplicates
        if (error.name !== "SequelizeUniqueConstraintError") {
          console.error(`Error creating section soil: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${sectionSoilsCreated.length} section_soil records\n`);

    // ========== 2. Fill crop_recs ==========
    console.log("🌾 Filling crop_recs table...");
    const cropRecsCreated = [];

    for (let i = 0; i < 15; i++) {
      const cropName = randomFromArray(cropNames);
      const season = randomFromArray(seasons);

      try {
        const cropRec = await CropRec.create({
          cropName: cropName,
          growingSeason: season,
          plantingHarvestingMonths: `${randomInt(1, 3)}-${randomInt(8, 12)}`,
          minTemperature: randomFloat(10, 20),
          maxTemperature: randomFloat(25, 35),
          optimalTemperatureRange: `${randomFloat(18, 22)}-${randomFloat(28, 32)}°C`,
          minRainfall: randomFloat(400, 600),
          maxRainfall: randomFloat(800, 1200),
          idealRainfallRange: `${randomFloat(500, 700)}-${randomFloat(900, 1100)}mm`,
          soilTypeRequirements: randomFromArray(soilTypes),
          minPh: randomFloat(5.5, 6.0),
          maxPh: randomFloat(7.0, 7.5),
          idealPh: randomFloat(6.5, 7.0),
          nitrogenNeeds: randomFloat(50, 150),
          phosphorusNeeds: randomFloat(30, 100),
          potassiumNeeds: randomFloat(80, 200),
          waterRequirement: randomFromArray(waterReqs),
          irrigationRequirement: `${randomInt(3, 7)} times per week`,
          sunlightRequirement: randomFromArray(sunlightReqs),
          dailySunlightHours: randomFloat(6, 10),
          maturityDuration: randomInt(60, 180),
          pestDiseaseSensitivity: "Sensitive to aphids, fungal diseases in high humidity",
          expectedYieldPerHectare: randomFloat(2000, 8000),
        });
        cropRecsCreated.push(cropRec);
      } catch (error) {
        if (error.name !== "SequelizeUniqueConstraintError") {
          console.error(`Error creating crop rec: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${cropRecsCreated.length} crop_rec records\n`);

    // ========== 3. Fill crop_tables ==========
    console.log("📋 Filling crop_tables table...");
    const cropTablesCreated = [];

    for (let i = 0; i < 15; i++) {
      const farmer = randomFromArray(farmers);
      const cropRec = randomFromArray(cropRecsCreated);

      if (!cropRec) continue;

      const datePlanted = new Date();
      datePlanted.setDate(datePlanted.getDate() - randomInt(30, 180));
      const dateHarvested = new Date(datePlanted);
      dateHarvested.setDate(dateHarvested.getDate() + randomInt(60, 150));

      try {
        const cropTable = await CropTable.create({
          cropRecId: cropRec.id,
          clientId: farmer.id,
          cropName: cropRec.cropName,
          datePlanted: datePlanted,
          dateHarvested: Math.random() > 0.5 ? dateHarvested : null, // Some crops not yet harvested
        });
        cropTablesCreated.push(cropTable);
      } catch (error) {
        console.error(`Error creating crop table: ${error.message}`);
      }
    }
    console.log(`✅ Created ${cropTablesCreated.length} crop_table records\n`);

    // ========== 4. Fill crop_section_soils (junction table) ==========
    console.log("🔗 Filling crop_section_soils table...");
    let cropSectionSoilsCreated = 0;

    for (let i = 0; i < 20; i++) {
      const sectionSoil = randomFromArray(sectionSoilsCreated);
      const cropTable = randomFromArray(cropTablesCreated);

      if (!sectionSoil || !cropTable) continue;

      try {
        await CropSectionSoil.create({
          sectionSoilId: sectionSoil.id,
          cropTableId: cropTable.id,
        });
        cropSectionSoilsCreated++;
      } catch (error) {
        // Skip duplicates (unique constraint on section_soil_id + crop_table_id)
        if (error.name !== "SequelizeUniqueConstraintError") {
          console.error(`Error creating crop section soil: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${cropSectionSoilsCreated} crop_section_soil records\n`);

    // ========== Summary ==========
    console.log("=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ section_soils: ${sectionSoilsCreated.length} records`);
    console.log(`✅ crop_recs: ${cropRecsCreated.length} records`);
    console.log(`✅ crop_tables: ${cropTablesCreated.length} records`);
    console.log(`✅ crop_section_soils: ${cropSectionSoilsCreated} records`);
    console.log("=".repeat(60));
    console.log("✅ Data filling completed successfully!\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error filling data:");
    console.error("Message:", error.message);

    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }

    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignore close errors
    }
    process.exit(1);
  }
};

// Run the script
fillRandomData();

