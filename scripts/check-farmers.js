/**
 * Script to check existing farmers in the database
 * Run with: node scripts/check-farmers.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { sequelize } = require("../src/config/db");

const checkFarmers = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.\n");

    // Check all farmers
    const farmers = await sequelize.query(
      `SELECT id, full_name, email, username, created_at 
       FROM farmers 
       ORDER BY id`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!farmers || farmers.length === 0) {
      console.log("❌ No farmers found in the database.\n");
    } else {
      console.log(`✅ Found ${farmers.length} farmer(s):\n`);
      farmers.forEach((farmer, index) => {
        console.log(`${index + 1}. Farmer ID: ${farmer.id}`);
        console.log(`   Full Name: ${farmer.full_name}`);
        console.log(`   Email: ${farmer.email}`);
        console.log(`   Username: ${farmer.username}`);
        console.log(`   Created: ${farmer.created_at}\n`);
      });
    }

    // Check for specific email
    const farmerByEmail = await sequelize.query(
      `SELECT id, full_name, email, username 
       FROM farmers 
       WHERE email = :email OR username = :username 
       LIMIT 1`,
      {
        replacements: { 
          email: "farmer@test.com",
          username: "testfarmer"
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("=".repeat(60));
    console.log("🔍 Searching for farmer@test.com or username testfarmer:");
    if (farmerByEmail && farmerByEmail.length > 0) {
      const f = farmerByEmail[0];
      console.log(`✅ Found: ID ${f.id}, Email: ${f.email}, Username: ${f.username}`);
    } else {
      console.log("❌ Not found!");
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error checking farmers:");
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

checkFarmers();

