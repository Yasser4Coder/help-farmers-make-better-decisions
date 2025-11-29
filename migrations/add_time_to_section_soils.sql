-- Migration: Add time column to section_soils table
-- Run this migration to add a time column to store the specific time/date of soil data

-- Add time column (DATETIME to store both date and time)
ALTER TABLE section_soils 
ADD COLUMN IF NOT EXISTS time DATETIME NULL 
COMMENT 'Date and time for the soil data record' 
AFTER section;

-- Optional: Add index for better query performance on time-based queries
CREATE INDEX IF NOT EXISTS idx_section_soils_time ON section_soils(time);

-- Optional: Add index on time, client_id, and land_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_section_soils_client_land_time ON section_soils(client_id, land_id, time);

