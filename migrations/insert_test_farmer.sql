-- Script to insert a test farmer for testing the login endpoint
-- WARNING: This creates a test user. Change the password before using in production!
-- The password will be hashed automatically by Sequelize hooks

-- Test farmer credentials:
-- Username: testfarmer
-- Email: test@farmer.com
-- Password: Test123! (will be hashed automatically)

-- Note: Since Sequelize has hooks that hash passwords, we need to insert with a hashed password
-- This is a bcrypt hash for "Test123!" (cost factor 10)
-- To generate a new hash, you can use: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(console.log)"

INSERT INTO farmers (full_name, email, username, phone_number, password, created_at, updated_at)
VALUES (
  'Test Farmer',
  'test@farmer.com',
  'testfarmer',
  '1234567890',
  '$2a$10$rOzJwKqJ8bO1JqHqJqJqJe1qHqJqJqJqJqJqJqJqJqJqJqJqJqJqJ', -- This needs to be a real bcrypt hash
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  full_name = VALUES(full_name),
  updated_at = NOW();

-- Alternative: Insert via Sequelize or use a script to hash the password properly
-- The password hash above is a placeholder - you need to generate a real bcrypt hash

