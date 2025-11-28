# Database Migrations

This directory contains SQL migration scripts for the database.

## Adding Time Column to Weathers Table

### Migration File
- `add_time_to_weathers.sql` - Adds a `time` column to the `weathers` table

### How to Run

#### Option 1: Using MySQL Command Line
```bash
mysql -u your_username -p your_database_name < migrations/add_time_to_weathers.sql
```

#### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open MySQL Workbench or phpMyAdmin
2. Connect to your database
3. Copy the contents of `add_time_to_weathers.sql`
4. Execute the SQL script

#### Option 3: Using Node.js Script (Recommended)
You can create a simple script to run the migration. Create a file `run-migration.js`:

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'add_time_to_weathers.sql'), 
      'utf8'
    );
    
    await connection.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
```

Then run:
```bash
node run-migration.js
```

### What This Migration Does

1. Adds a `time` column (DATETIME) to the `weathers` table
   - Allows NULL values (for existing records)
   - Stores the date and time for weather records

2. Creates indexes for better query performance:
   - Index on `time` column
   - Composite index on `land_id` and `time` for efficient queries

### Notes

- The migration uses `IF NOT EXISTS` to prevent errors if the column already exists
- Existing records will have NULL in the `time` column until updated
- The weather service will automatically populate the `time` column for new records

