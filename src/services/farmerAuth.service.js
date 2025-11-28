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
