-- Migration: Add time column to weathers table
-- Run this migration to add a time column to store the specific time/date of weather data

-- Add time column (assuming we want to store the date/time for the weather record)
-- Using DATETIME to store both date and time
ALTER TABLE weathers 
ADD COLUMN IF NOT EXISTS time DATETIME NULL 
COMMENT 'Date and time for the weather record' 
AFTER client_id;

-- Optional: Add index for better query performance on time-based queries
CREATE INDEX IF NOT EXISTS idx_weathers_time ON weathers(time);

-- Optional: Add index on time and land_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_weathers_land_time ON weathers(land_id, time);

