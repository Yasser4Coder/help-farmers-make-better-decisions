const { Farmer, Ing, Land } = require("../models");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("../constants");
const { sequelize } = require("../config/db");

/**
 * Farmer Service
 */
class FarmerService {
  /**
   * Get all farmers
   */
  static async getAllFarmers() {
    const results = await sequelize.query(
      `SELECT id, full_name, email, username, phone_number, created_at, updated_at 
       FROM farmers 
       ORDER BY created_at DESC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const farmers = results.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return farmers;
  }

  /**
   * Get farmers by engineer ID (farmers assigned to an engineer)
   */
  static async getFarmersByEngineer(engineerId) {
    // Verify engineer exists
    const engineer = await Ing.findByPk(engineerId);
    if (!engineer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Engineer not found");
    }

    // Get farmers through the many-to-many relationship
    const results = await sequelize.query(
      `SELECT DISTINCT 
         f.id, 
         f.full_name, 
         f.email, 
         f.username, 
         f.phone_number, 
         f.created_at, 
         f.updated_at 
       FROM farmers f
       INNER JOIN farmer_ings fi ON f.id = fi.farmer_id
       WHERE fi.ing_id = :engineerId
       ORDER BY f.created_at DESC`,
      {
        replacements: { engineerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const farmers = results.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return farmers;
  }

  /**
   * Get farmer by ID
   */
  static async getFarmerById(farmerId) {
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

    const farmer = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      username: row.username,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return farmer;
  }

  /**
   * Get land IDs by farmer ID
   */
  static async getLandIdsByFarmerId(farmerId) {
    // Verify farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    if (!farmer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Farmer not found");
    }

    // Get all land IDs for this farmer
    const results = await sequelize.query(
      `SELECT id FROM lands WHERE client_id = :farmerId ORDER BY id`,
      {
        replacements: { farmerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Extract just the IDs
    return results.map((row) => row.id);
  }
}

module.exports = FarmerService;

