const { Farmer } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { generateToken } = require("../utils/generateToken");
const { Op } = require("sequelize");

/**
 * Farmer Authentication Service
 */
class FarmerAuthService {
  /**
   * Register a new farmer
   */
  static async register(
    fullName,
    email,
    username,
    password,
    phoneNumber = null,
    fcmToken = null
  ) {
    const { Op } = require("sequelize");
    const { sequelize } = require("../config/db");

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check if farmer with same email or username already exists (case-insensitive)
    const existingFarmers = await sequelize.query(
      `SELECT id, email, username FROM farmers 
       WHERE LOWER(email) = LOWER(:email) OR LOWER(username) = LOWER(:username) 
       LIMIT 2`,
      {
        replacements: { email: normalizedEmail, username: normalizedUsername },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingFarmers && existingFarmers.length > 0) {
      const existing = existingFarmers[0];
      if (existing.email.toLowerCase() === normalizedEmail) {
        throw new ApiError(StatusCodes.CONFLICT, "Email is already registered");
      }
      if (existing.username.toLowerCase() === normalizedUsername) {
        throw new ApiError(StatusCodes.CONFLICT, "Username is already taken");
      }
    }

    // Create new farmer (password will be hashed by the beforeCreate hook)
    const farmer = await Farmer.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password: password,
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      fcmToken: fcmToken || null,
    });

    // Generate JWT token
    const token = generateToken({
      id: farmer.id,
      email: farmer.email,
      username: farmer.username,
      userType: "farmer",
    });

    // Remove password from response
    const farmerResponse = {
      id: farmer.id,
      fullName: farmer.fullName,
      email: farmer.email,
      username: farmer.username,
      phoneNumber: farmer.phoneNumber,
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt,
    };

    return {
      farmer: farmerResponse,
      token,
    };
  }

  /**
   * Login farmer
   */
  static async login(usernameOrEmail, password) {
    // Find farmer by username or email
    // Use raw query to avoid issues with missing columns
    const { sequelize } = require("../config/db");

    // Trim and normalize the search value
    const searchValue = usernameOrEmail ? String(usernameOrEmail).trim() : null;

    if (!searchValue) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Normalize password
    const passwordValue = password ? String(password).trim() : null;

    if (!passwordValue) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Use case-insensitive comparison for email/username
    let results;
    try {
      results = await sequelize.query(
        `SELECT id, full_name, email, username, phone_number, password, created_at, updated_at 
         FROM farmers 
         WHERE LOWER(TRIM(username)) = LOWER(TRIM(:search)) OR LOWER(TRIM(email)) = LOWER(TRIM(:search)) 
         LIMIT 1`,
        {
          replacements: { search: searchValue },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    } catch (dbError) {
      // Log database error for debugging
      const logger = require("../config/logger");
      logger.error("Database query error in farmer login:", dbError);
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    if (!results || results.length === 0) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    const row = results[0];

    // Convert database row to model-like object
    const farmer = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      comparePassword: async function (candidatePassword) {
        const bcrypt = require("bcryptjs");
        if (!candidatePassword || !this.password) {
          return false;
        }
        try {
          return await bcrypt.compare(candidatePassword, this.password);
        } catch (error) {
          return false;
        }
      },
    };

    // Check if password exists
    if (!farmer.password) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Check password using bcrypt (passwordValue was already normalized above)
    const isPasswordValid = await farmer.comparePassword(passwordValue);

    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: farmer.id,
      email: farmer.email,
      username: farmer.username,
      userType: "farmer",
    });

    // Remove password from response
    const farmerResponse = {
      id: farmer.id,
      fullName: farmer.fullName,
      email: farmer.email,
      username: farmer.username,
      phoneNumber: farmer.phoneNumber,
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt,
    };

    return {
      farmer: farmerResponse,
      token,
    };
  }

  /**
   * Get current farmer profile
   */
  static async getProfile(farmerId) {
    // Use raw query to avoid column mapping issues
    const { sequelize } = require("../config/db");

    const results = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number, created_at, updated_at 
       FROM farmers 
       WHERE id = :farmerId 
       LIMIT 1`,
      {
        replacements: { farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    const row = results[0];

    const farmerResponse = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return farmerResponse;
  }
}

module.exports = FarmerAuthService;
