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
   * Register a new engineer
   */
  static async register(ingData) {
    const { email, username } = ingData;

    // Check if engineer with email already exists
    const existingIngByEmail = await Ing.findOne({
      where: { email },
    });

    if (existingIngByEmail) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Engineer with this email already exists"
      );
    }

    // Check if engineer with username already exists
    const existingIngByUsername = await Ing.findOne({
      where: { username },
    });

    if (existingIngByUsername) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Engineer with this username already exists"
      );
    }

    // Create new engineer
    const ing = await Ing.create(ingData);

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

