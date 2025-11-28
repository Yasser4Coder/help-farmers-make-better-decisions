# Database Migrations

## Add FCM Token Column

The `fcm_token` column needs to be added to both `farmers` and `ings` tables for the notification system to work. This is required to fix the error: `Unknown column 'fcm_token' in 'SELECT'`

### Quick Fix - Simple SQL (Recommended)

Run this simple SQL script on your production database:

```sql
-- Add fcm_token column to farmers table
ALTER TABLE farmers
ADD COLUMN fcm_token TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications'
AFTER password;

-- Add fcm_token column to ings table  
ALTER TABLE ings
ADD COLUMN fcm_token TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications'
AFTER password;
```

### Option 1: Using MySQL Command Line

```bash
# Connect to your MySQL database and run:
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < migrations/add_fcm_token_simple.sql
```

### Option 2: Using Database Management Tool

If you're using a database management tool (phpMyAdmin, MySQL Workbench, DBeaver, etc.):

1. Connect to your production database
2. Open the SQL query editor
3. Copy and paste the SQL commands above
4. Execute the query

### Option 3: Using Render.com Database Dashboard

If your database is hosted on Render.com:

1. Go to your Render.com dashboard
2. Find your MySQL database service
3. Click on "Connect" or "Shell"
4. Connect to the database using the provided credentials
5. Run the SQL commands above

### Verification

After running the migration, verify the columns were added:

```sql
DESCRIBE farmers;
DESCRIBE ings;
```

You should see the `fcm_token` column in both tables.

### Troubleshooting

- **Error: Column already exists**: This means the migration was already run. You can ignore this error.
- **Error: Table doesn't exist**: Make sure you're connected to the correct database.
- **Permission denied**: Make sure your database user has ALTER TABLE permissions.

