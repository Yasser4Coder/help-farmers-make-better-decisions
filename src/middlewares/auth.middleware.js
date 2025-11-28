const { verifyToken } = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { Farmer, Ing } = require("../models");

/**
 * Middleware to authenticate Farmer users
 */
const authenticateFarmer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Access token is missing or invalid"
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyToken(token);

    // Find farmer
    const farmer = await Farmer.findByPk(decoded.id);

    if (!farmer) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Farmer not found");
    }

    // Attach farmer to request
    req.farmer = farmer;
    req.userId = farmer.id;
    req.userType = "farmer";

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

/**
 * Middleware to authenticate Ing (Engineer) users
 */
const authenticateIng = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Access token is missing or invalid"
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyToken(token);

    // Find engineer
    const ing = await Ing.findByPk(decoded.id);

    if (!ing) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Engineer not found");
    }

    // Attach engineer to request
    req.ing = ing;
    req.userId = ing.id;
    req.userType = "ing";

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

module.exports = {
  authenticateFarmer,
  authenticateIng,
};

