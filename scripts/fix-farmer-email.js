/**
 * Script to update existing farmer email to match the expected test credentials
 * Run with: node scripts/fix-farmer-email.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { sequelize } = require("../src/config/db");

const fixFarmerEmail = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.\n");

    // Find farmer with username testfarmer
    const farmers = await sequelize.query(
      `SELECT id, full_name, email, username 
       FROM farmers 
       WHERE username = :username 
       LIMIT 1`,
      {
        replacements: { username: "testfarmer" },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!farmers || farmers.length === 0) {
      console.log("❌ No farmer found with username 'testfarmer'\n");
      await sequelize.close();
      process.exit(1);
    }

    const farmer = farmers[0];
    console.log(`📋 Current farmer info:`);
    console.log(`   ID: ${farmer.id}`);
    console.log(`   Email: ${farmer.email}`);
    console.log(`   Username: ${farmer.username}\n`);

    if (farmer.email === "farmer@test.com") {
      console.log("✅ Farmer email is already correct! No changes needed.\n");
      await sequelize.close();
      process.exit(0);
    }

    // Update the email
    console.log("🔄 Updating email to 'farmer@test.com'...\n");
    
    await sequelize.query(
      `UPDATE farmers 
       SET email = :newEmail, updated_at = NOW()
       WHERE id = :farmerId`,
      {
        replacements: { 
          newEmail: "farmer@test.com",
          farmerId: farmer.id
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Verify the update
    const [updatedFarmers] = await sequelize.query(
      `SELECT id, full_name, email, username 
       FROM farmers 
       WHERE id = :farmerId 
       LIMIT 1`,
      {
        replacements: { farmerId: farmer.id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (updatedFarmers && updatedFarmers.length > 0) {
      const updated = updatedFarmers[0];
      console.log("✅ Farmer email updated successfully!\n");
      console.log(`📋 Updated farmer info:`);
      console.log(`   ID: ${updated.id}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Username: ${updated.username}\n`);
      
      console.log("=".repeat(60));
      console.log("✅ You can now login with:");
      console.log("   Email: farmer@test.com");
      console.log("   Username: testfarmer");
      console.log("   Password: Farmer123!");
      console.log("=".repeat(60) + "\n");
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error updating farmer email:");
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

fixFarmerEmail();

