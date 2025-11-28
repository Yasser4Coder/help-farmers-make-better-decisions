-- Migration: Add fcm_token column to farmers and ings tables
-- Run this SQL script on your production database
-- Safe to run multiple times - checks if column exists first

-- Add fcm_token column to farmers table (if it doesn't exist)
SET @dbname = DATABASE();
SET @tablename = "farmers";
SET @columnname = "fcm_token";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column fcm_token already exists in farmers table' AS message;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications' AFTER password;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add fcm_token column to ings table (if it doesn't exist)
SET @tablename = "ings";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column fcm_token already exists in ings table' AS message;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications' AFTER password;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

