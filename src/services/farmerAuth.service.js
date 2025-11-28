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
   * Login farmer
   */
  static async login(usernameOrEmail, password) {
    // Find farmer by username or email
    // Use raw query to avoid issues with missing columns
    const { sequelize } = require("../config/db");
    
    // First, try to find the farmer using a more robust query
    const results = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number, password, created_at, updated_at 
       FROM farmers 
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

    // Check password using bcrypt
    if (!password) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    const isPasswordValid = await farmer.comparePassword(password);

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
