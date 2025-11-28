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
    const ing = await Ing.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!ing) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid username/email or password"
      );
    }

    // Check password
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
    const ingResponse = ing.toJSON();
    delete ingResponse.password;

    return {
      ing: ingResponse,
      token,
    };
  }

  /**
   * Get current engineer profile
   */
  static async getProfile(ingId) {
    const ing = await Ing.findByPk(ingId);

    if (!ing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
    }

    const ingResponse = ing.toJSON();
    delete ingResponse.password;

    return ingResponse;
  }
}

module.exports = IngAuthService;

