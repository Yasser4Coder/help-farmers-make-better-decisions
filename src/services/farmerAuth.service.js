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
  static async register(farmerData) {
    const { email, username } = farmerData;

    // Check if farmer with email already exists
    const existingFarmerByEmail = await Farmer.findOne({
      where: { email },
    });

    if (existingFarmerByEmail) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Farmer with this email already exists"
      );
    }

    // Check if farmer with username already exists
    const existingFarmerByUsername = await Farmer.findOne({
      where: { username },
    });

    if (existingFarmerByUsername) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Farmer with this username already exists"
      );
    }

    // Create new farmer
    const farmer = await Farmer.create(farmerData);

    // Generate JWT token
    const token = generateToken({
      id: farmer.id,
      email: farmer.email,
      username: farmer.username,
      userType: "farmer",
    });

    // Remove password from response
    const farmerResponse = farmer.toJSON();
    delete farmerResponse.password;

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
    const farmer = await Farmer.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!farmer) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Check password
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
    const farmerResponse = farmer.toJSON();
    delete farmerResponse.password;

    return {
      farmer: farmerResponse,
      token,
    };
  }

  /**
   * Get current farmer profile
   */
  static async getProfile(farmerId) {
    const farmer = await Farmer.findByPk(farmerId);

    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    const farmerResponse = farmer.toJSON();
    delete farmerResponse.password;

    return farmerResponse;
  }
}

module.exports = FarmerAuthService;
