/**
 * Script to create test farmers and engineers in the database
 * Run with: node scripts/create-test-users.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { sequelize } = require("../src/config/db");
const { Farmer, Ing } = require("../src/models");
const { Op } = require("sequelize");

const createTestUsers = async () => {
  try {
    console.log("🔌 Connecting to database...");
    console.log("DB Host:", process.env.DB_HOST || "localhost");
    console.log("DB Name:", process.env.DB_NAME);
    console.log("");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.\n");

    // ========== Create Test Farmer ==========
    const testFarmerData = {
      fullName: "Test Farmer",
      email: "farmer@test.com",
      username: "testfarmer",
      phoneNumber: "1234567890",
      password: "Farmer123!",
    };

    // Check if farmer exists by email OR username
    let farmer = await Farmer.findOne({
      where: {
        [Op.or]: [
          { email: testFarmerData.email },
          { username: testFarmerData.username }
        ],
      },
    });

    if (farmer) {
      console.log("⚠️  Test farmer already exists!");
      console.log("   ID:", farmer.id);
      console.log("   Email:", farmer.email);
      console.log("   Username:", farmer.username);
    } else {
      try {
        farmer = await Farmer.create(testFarmerData);
        console.log("✅ Test farmer created successfully!");
      } catch (createError) {
        console.log("⚠️  Could not create farmer (may already exist with different email/username)");
        console.error("   Error:", createError.message);
      }
    }

    // ========== Create Test Engineer (Ing) ==========
    const testEngineerData = {
      fullName: "Test Engineer",
      email: "engineer@test.com",
      username: "testengineer",
      phoneNumber: "0987654321",
      password: "Engineer123!",
    };

    // Check if engineer exists by email OR username
    let engineer = await Ing.findOne({
      where: {
        [Op.or]: [
          { email: testEngineerData.email },
          { username: testEngineerData.username }
        ],
      },
    });

    if (engineer) {
      console.log("⚠️  Test engineer already exists!");
      console.log("   ID:", engineer.id);
      console.log("   Email:", engineer.email);
      console.log("   Username:", engineer.username);
    } else {
      try {
        engineer = await Ing.create(testEngineerData);
        console.log("✅ Test engineer created successfully!");
      } catch (createError) {
        console.log("⚠️  Could not create engineer (may already exist with different email/username)");
        console.error("   Error:", createError.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📝 TEST CREDENTIALS");
    console.log("=".repeat(60));

    console.log("\n👨‍🌾 FARMER LOGIN:");
    console.log("   Email:", testFarmerData.email);
    console.log("   Username:", testFarmerData.username);
    console.log("   Password:", testFarmerData.password);
    console.log("\n   Login endpoint:");
    console.log("   POST https://help-farmers-make-better-decisions.onrender.com/api/auth/farmer/login");
    console.log("   Body:", JSON.stringify({ 
      username: testFarmerData.email, 
      password: testFarmerData.password 
    }, null, 2));

    console.log("\n👨‍💻 ENGINEER (ING) LOGIN:");
    console.log("   Email:", testEngineerData.email);
    console.log("   Username:", testEngineerData.username);
    console.log("   Password:", testEngineerData.password);
    console.log("\n   Login endpoint:");
    console.log("   POST https://help-farmers-make-better-decisions.onrender.com/api/auth/ing/login");
    console.log("   Body:", JSON.stringify({ 
      username: testEngineerData.email, 
      password: testEngineerData.password 
    }, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("✅ Setup complete!");
    console.log("=".repeat(60) + "\n");

    // Close database connection
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating test users:");
    console.error("Message:", error.message);

    if (error.errors) {
      console.error("\nValidation errors:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }

    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }

    // Close database connection
    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignore close errors
    }
    process.exit(1);
  }
};

// Run the script
createTestUsers();

