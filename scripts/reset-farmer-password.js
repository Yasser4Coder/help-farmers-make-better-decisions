/**
 * Script to reset farmer password to match expected test credentials
 * Run with: node scripts/reset-farmer-password.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { sequelize } = require("../src/config/db");
const bcrypt = require("bcryptjs");

const resetFarmerPassword = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.\n");

    const expectedPassword = "Farmer123!";
    const expectedEmail = "farmer@test.com";

    // Find farmer with email or username
    const farmers = await sequelize.query(
      `SELECT id, full_name, email, username, password
       FROM farmers 
       WHERE email = :email OR username = :username 
       LIMIT 1`,
      {
        replacements: { 
          email: expectedEmail,
          username: "testfarmer"
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!farmers || farmers.length === 0) {
      console.log(`❌ No farmer found with email '${expectedEmail}' or username 'testfarmer'\n`);
      await sequelize.close();
      process.exit(1);
    }

    const farmer = farmers[0];
    console.log(`📋 Current farmer info:`);
    console.log(`   ID: ${farmer.id}`);
    console.log(`   Email: ${farmer.email}`);
    console.log(`   Username: ${farmer.username}\n`);

    // Check if password is already correct
    const isPasswordCorrect = await bcrypt.compare(expectedPassword, farmer.password);
    
    if (isPasswordCorrect) {
      console.log("✅ Password is already correct! No changes needed.\n");
      await sequelize.close();
      process.exit(0);
    }

    // Hash the new password
    console.log(`🔄 Resetting password to '${expectedPassword}'...\n`);
    const hashedPassword = await bcrypt.hash(expectedPassword, 10);
    
    // Update the password
    await sequelize.query(
      `UPDATE farmers 
       SET password = :hashedPassword, updated_at = NOW()
       WHERE id = :farmerId`,
      {
        replacements: { 
          hashedPassword: hashedPassword,
          farmerId: farmer.id
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    console.log("✅ Password reset successfully!\n");
    
    console.log("=".repeat(60));
    console.log("✅ Login Credentials:");
    console.log(`   Email: ${farmer.email}`);
    console.log(`   Username: ${farmer.username}`);
    console.log(`   Password: ${expectedPassword}`);
    console.log("=".repeat(60) + "\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error resetting farmer password:");
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

resetFarmerPassword();

