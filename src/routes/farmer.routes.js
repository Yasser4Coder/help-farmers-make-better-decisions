const express = require("express");
const router = express.Router();
const farmerController = require("../controllers/farmer.controller");
const farmerConnectionController = require("../controllers/farmerConnection.controller");
const farmerConnectionValidation = require("../validations/farmerConnection.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateIng } = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Farmers
 *     description: "Farmer management endpoints"
 */

/**
 * @swagger
 * /api/farmers:
 *   get:
 *     summary: Get all farmers
 *     description: Retrieves a list of all farmers in the system. Requires engineer authentication.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     farmers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           username:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of farmers
 *                 message:
 *                   type: string
 *                   example: "Farmers retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 */
router.get("/", apiLimiter, authenticateIng, farmerController.getAllFarmers);

/**
 * @swagger
 * /api/farmers/my-farmers:
 *   get:
 *     summary: Get farmers assigned to the authenticated engineer
 *     description: Retrieves a list of farmers that are assigned to the currently authenticated engineer.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     farmers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           username:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of farmers assigned to the engineer
 *                 message:
 *                   type: string
 *                   example: "Farmers retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 */
router.get("/my-farmers", apiLimiter, authenticateIng, farmerController.getFarmersByEngineer);

/**
 * @swagger
 * /api/farmers/{id}:
 *   get:
 *     summary: Get farmer by ID
 *     description: Retrieves a specific farmer by their ID. Requires engineer authentication.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Farmer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Farmer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Farmer retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid farmer ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid farmer ID"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 *       404:
 *         description: Farmer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Farmer not found"
 */
router.get("/:id", apiLimiter, authenticateIng, farmerController.getFarmerById);

/**
 * @swagger
 * /api/farmers/connect:
 *   post:
 *     summary: Connect engineer to a farmer
 *     description: Creates a connection between the authenticated engineer and a specific farmer (identified by username). This allows the engineer to access and manage the farmer's data.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the farmer to connect to
 *                 example: "testfarmer"
 *     responses:
 *       201:
 *         description: Engineer connected to farmer successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Connection ID
 *                     farmerId:
 *                       type: integer
 *                     engineerId:
 *                       type: integer
 *                     farmer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                           nullable: true
 *                     engineer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Engineer connected to farmer successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 *       404:
 *         description: Farmer or Engineer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Farmer not found"
 *       409:
 *         description: Connection already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "Engineer is already connected to this farmer"
 */
router.post(
  "/connect",
  apiLimiter,
  authenticateIng,
  validate(farmerConnectionValidation.connect),
  farmerConnectionController.connectToFarmer
);

/**
 * @swagger
 * /api/farmers/disconnect/{farmerId}:
 *   delete:
 *     summary: Disconnect engineer from a farmer
 *     description: Removes the connection between the authenticated engineer and a specific farmer.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the farmer to disconnect from
 *         example: 1
 *     responses:
 *       200:
 *         description: Engineer disconnected from farmer successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Engineer disconnected from farmer successfully"
 *                 message:
 *                   type: string
 *                   example: "Engineer disconnected from farmer successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid farmer ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid farmer ID"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Access token is missing or invalid"
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Connection between engineer and farmer not found"
 */
router.delete(
  "/disconnect/:farmerId",
  apiLimiter,
  authenticateIng,
  farmerConnectionController.disconnectFromFarmer
);

module.exports = router;

