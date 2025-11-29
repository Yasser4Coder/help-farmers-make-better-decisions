/**
 * Script to insert 2 sample alerts into the database
 * Run with: node scripts/insert-sample-alerts.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { sequelize } = require("../src/config/db");
const { Alert, Farmer, Land } = require("../src/models");

const insertSampleAlerts = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established.\n");

    // Get first farmer and land
    const farmer = await Farmer.findOne();
    const land = await Land.findOne({
      where: {
        clientId: farmer ? farmer.id : null,
      },
    });

    if (!farmer) {
      console.log("❌ No farmers found. Please create a farmer first.");
      process.exit(1);
    }

    if (!land) {
      console.log("❌ No lands found for the farmer. Please create a land first.");
      process.exit(1);
    }

    console.log(`📊 Using Farmer ID: ${farmer.id}, Land ID: ${land.id}\n`);

    // Insert 2 sample alerts
    console.log("📝 Inserting sample alerts...");

    // Alert 1: Irrigation Alert
    const alert1 = await Alert.create({
      farmerId: farmer.id,
      landId: land.id,
      section: "A1",
      alertType: "irrigation",
      title: "Irrigation Alert",
      description:
        "Soil moisture is low in sector A1 (25.5%). Immediate irrigation required.",
      icon: "irrigation",
      color: "green",
    });
    console.log(`✅ Created Alert 1 (ID: ${alert1.id}): Irrigation Alert`);

    // Alert 2: Temperature Warning
    const alert2 = await Alert.create({
      farmerId: farmer.id,
      landId: land.id,
      section: null,
      alertType: "temperature",
      title: "Temperature Warning",
      description:
        "High temperature expected on Tomorrow (Wed, Jan 17): 38.5°C. Take precautions to protect your crops from heat stress.",
      icon: "temperature",
      color: "red",
    });
    console.log(`✅ Created Alert 2 (ID: ${alert2.id}): Temperature Warning`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Successfully inserted 2 sample alerts!");
    console.log("=".repeat(60));
    console.log(`   Alert 1: Irrigation Alert (ID: ${alert1.id})`);
    console.log(`   Alert 2: Temperature Warning (ID: ${alert2.id})`);
    console.log("=".repeat(60) + "\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error inserting alerts:");
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
insertSampleAlerts();

