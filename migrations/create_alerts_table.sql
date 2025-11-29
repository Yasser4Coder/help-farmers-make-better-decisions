-- Migration: Create alerts table
-- Run this migration to create a table for storing weather and soil alerts for farmers

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  land_id INT NULL,
  section VARCHAR(255) NULL,
  alert_type VARCHAR(50) NOT NULL COMMENT 'Type: irrigation, temperature, rainfall, wind',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NULL COMMENT 'Icon identifier: irrigation, temperature, rainfall, wind',
  color VARCHAR(20) NULL COMMENT 'Color for UI: green, red, blue, orange',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE SET NULL,
  INDEX idx_alerts_farmer (farmer_id),
  INDEX idx_alerts_type (alert_type),
  INDEX idx_alerts_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

