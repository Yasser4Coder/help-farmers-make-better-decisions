const { Farmer, Ing, FarmerIng } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { sequelize } = require("../config/db");

/**
 * Farmer Connection Service
 * Handles connections between engineers and farmers
 */
class FarmerConnectionService {
  /**
   * Connect an engineer to a farmer
   */
  static async connectEngineerToFarmer(engineerId, farmerUsername) {
    // Verify engineer exists
    const engineer = await Ing.findByPk(engineerId);
    if (!engineer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
    }

    // Find farmer by username (case-insensitive)
    const farmerResults = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number 
       FROM farmers 
       WHERE LOWER(TRIM(username)) = LOWER(TRIM(:username)) 
       LIMIT 1`,
      {
        replacements: { username: farmerUsername },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!farmerResults || farmerResults.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    const farmerRow = farmerResults[0];
    const farmerId = farmerRow.id;

    // Get full farmer object for response
    const farmer = await Farmer.findByPk(farmerId);

    // Check if connection already exists
    const existingConnection = await sequelize.query(
      `SELECT id FROM farmer_ings 
       WHERE farmer_id = :farmerId 
       AND ing_id = :engineerId 
       LIMIT 1`,
      {
        replacements: { farmerId, engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingConnection && existingConnection.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Engineer is already connected to this farmer"
      );
    }

    // Create the connection
    const connection = await FarmerIng.create({
      farmerId,
      ingId: engineerId,
    });

    return {
      id: connection.id,
      farmerId: connection.farmerId,
      engineerId: connection.ingId,
      farmer: {
        id: farmer.id,
        fullName: farmer.fullName,
        email: farmer.email,
        username: farmer.username,
        phoneNumber: farmer.phoneNumber,
      },
      engineer: {
        id: engineer.id,
        fullName: engineer.fullName,
        email: engineer.email,
        username: engineer.username,
      },
    };
  }

  /**
   * Disconnect an engineer from a farmer
   */
  static async disconnectEngineerFromFarmer(engineerId, farmerId) {
    // Check if connection exists
    const existingConnection = await sequelize.query(
      `SELECT id FROM farmer_ings 
       WHERE farmer_id = :farmerId 
       AND ing_id = :engineerId 
       LIMIT 1`,
      {
        replacements: { farmerId, engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingConnection || existingConnection.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Connection between engineer and farmer not found"
      );
    }

    // Delete the connection
    await FarmerIng.destroy({
      where: {
        farmerId,
        ingId: engineerId,
      },
    });

    return { message: "Engineer disconnected from farmer successfully" };
  }
}

module.exports = FarmerConnectionService;

