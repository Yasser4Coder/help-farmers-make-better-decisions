-- Simple Migration: Add fcm_token column to farmers and ings tables
-- Run this SQL script on your production database
-- If column already exists, you'll get an error - that's OK, just ignore it

-- Add fcm_token column to farmers table
ALTER TABLE farmers
ADD COLUMN IF NOT EXISTS fcm_token TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications'
AFTER password;

-- Add fcm_token column to ings table  
ALTER TABLE ings
ADD COLUMN IF NOT EXISTS fcm_token TEXT NULL COMMENT 'Firebase Cloud Messaging token for push notifications'
AFTER password;

