/**
 * Script to run database migrations
 * Usage: node migrations/run-migration.js <migration-file>
 * Example: node migrations/run-migration.js add_time_to_weathers.sql
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration(migrationFile) {
  if (!migrationFile) {
    console.error("❌ Please specify a migration file");
    console.log("Usage: node migrations/run-migration.js <migration-file>");
    console.log("Example: node migrations/run-migration.js add_time_to_weathers.sql");
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

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
    multipleStatements: true,
  });

  try {
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("🚀 Executing migration...");
    await connection.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log(`   Applied: ${migrationFile}`);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(`   Error: ${error.message}`);
    if (error.sql) {
      console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
    }
    process.exit(1);
  } finally {
    await connection.end();
    console.log("🔌 Database connection closed.");
  }
}

// Get migration file from command line arguments
const migrationFile = process.argv[2];
runMigration(migrationFile);

