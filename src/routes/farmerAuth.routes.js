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
 *   description: Farmer authentication endpoints
 */

/**
 * @swagger
 * /api/auth/farmer/register:
 *   post:
 *     summary: Register a new farmer
 *     tags: [Farmer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - username
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Farmer registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already exists
 */
router.post(
  "/register",
  authLimiter,
  validate(farmerAuthValidation.register),
  farmerAuthController.register
);

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
 *       401:
 *         description: Invalid credentials
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
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateFarmer, farmerAuthController.getProfile);

module.exports = router;

