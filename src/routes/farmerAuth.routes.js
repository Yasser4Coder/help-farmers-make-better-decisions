const express = require("express");
const router = express.Router();
const farmerAuthController = require("../controllers/farmerAuth.controller");
const farmerAuthValidation = require("../validations/farmerAuth.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateFarmer } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   name: Farmer Auth
 *   description: Farmer authentication endpoints. Note: Farmers are created directly in the database, not through API registration.
 */

/**
 * @swagger
 * /api/auth/farmer/login:
 *   post:
 *     summary: Login as a farmer
 *     tags: [Farmer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Farmer logged in successfully
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
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Farmer logged in successfully"
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
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid username/email or password"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many authentication attempts, please try again later."
 */
router.post(
  "/login",
  authLimiter,
  validate(farmerAuthValidation.login),
  farmerAuthController.login
);

/**
 * @swagger
 * /api/auth/farmer/profile:
 *   get:
 *     summary: Get current farmer profile
 *     tags: [Farmer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer profile retrieved successfully
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
 *                   example: "Farmer profile retrieved successfully"
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
router.get("/profile", authenticateFarmer, farmerAuthController.getProfile);

module.exports = router;

