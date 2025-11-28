const { Ing } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { generateToken } = require("../utils/generateToken");
const { Op } = require("sequelize");

/**
 * Ing (Engineer) Authentication Service
 */
class IngAuthService {
  /**
   * Login engineer
   */
  static async login(usernameOrEmail, password) {
    // Find engineer by username or email
    // Use raw query to avoid issues with missing columns
    const { sequelize } = require("../config/db");
    
    // First, try to find the engineer using a more robust query
    const results = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number, password, created_at, updated_at 
       FROM ings 
       WHERE username = :search OR email = :search 
       LIMIT 1`,
      {
        replacements: { search: usernameOrEmail },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    const row = results[0];

    // Convert database row to model-like object
    const ing = {
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
    if (!ing.password) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Check password using bcrypt
    if (!password) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    const isPasswordValid = await ing.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: ing.id,
      email: ing.email,
      username: ing.username,
      userType: "ing",
    });

    // Remove password from response
    const ingResponse = {
      id: ing.id,
      fullName: ing.fullName,
      email: ing.email,
      username: ing.username,
      phoneNumber: ing.phoneNumber,
      createdAt: ing.createdAt,
      updatedAt: ing.updatedAt,
    };

    return {
      ing: ingResponse,
      token,
    };
  }

  /**
   * Get current engineer profile
   */
  static async getProfile(ingId) {
    // Use raw query to avoid column mapping issues
    const { sequelize } = require("../config/db");
    
    const results = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number, created_at, updated_at 
       FROM ings 
       WHERE id = :ingId 
       LIMIT 1`,
      {
        replacements: { ingId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
    }

    const row = results[0];

    const ingResponse = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return ingResponse;
  }
}

module.exports = IngAuthService;

