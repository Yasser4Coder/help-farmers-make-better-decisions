/**
 * Script to fill the time column in section_soils table with random dates
 * Usage: node scripts/fill-section-soils-time.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

async function fillTimeData() {
  console.log("🔌 Connecting to database...");
  console.log(`DB Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`DB Name: ${process.env.DB_NAME}`);
  console.log("");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Get all records that don't have a time value
    console.log("📊 Fetching section_soils records without time...");
    const [rows] = await connection.query(
      "SELECT id FROM section_soils WHERE time IS NULL"
    );

    if (rows.length === 0) {
      console.log("✅ All records already have time values!");
      return;
    }

    console.log(`📝 Found ${rows.length} records to update`);

    // Generate random dates within the last 90 days
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let updated = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        // Generate a random date between 90 days ago and now
        const randomTime = new Date(
          ninetyDaysAgo.getTime() +
            Math.random() * (now.getTime() - ninetyDaysAgo.getTime())
        );

        // Format as MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
        const timeString = randomTime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        await connection.query(
          "UPDATE section_soils SET time = ? WHERE id = ?",
          [timeString, row.id]
        );

        updated++;
      } catch (error) {
        console.error(`❌ Error updating record ${row.id}:`, error.message);
        errors++;
      }
    }

    console.log("");
    console.log("✅ Time data filling completed!");
    console.log(`   Updated: ${updated} records`);
    if (errors > 0) {
      console.log(`   Errors: ${errors} records`);
    }
  } catch (error) {
    console.error("❌ Error filling time data:");
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  } finally {
    await connection.end();
    console.log("🔌 Database connection closed.");
  }
}

fillTimeData();

