const express = require("express");
const router = express.Router();
const ingAuthController = require("../controllers/ingAuth.controller");
const ingAuthValidation = require("../validations/ingAuth.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateIng } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   name: Ing Auth
 *   description: Engineer authentication endpoints
 */

/**
 * @swagger
 * /api/auth/ing/register:
 *   post:
 *     summary: Register a new engineer
 *     tags: [Ing Auth]
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
 *         description: Engineer registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already exists
 */
router.post(
  "/register",
  authLimiter,
  validate(ingAuthValidation.register),
  ingAuthController.register
);

/**
 * @swagger
 * /api/auth/ing/login:
 *   post:
 *     summary: Login as an engineer
 *     tags: [Ing Auth]
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
 *         description: Engineer logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  authLimiter,
  validate(ingAuthValidation.login),
  ingAuthController.login
);

/**
 * @swagger
 * /api/auth/ing/profile:
 *   get:
 *     summary: Get current engineer profile
 *     tags: [Ing Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engineer profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateIng, ingAuthController.getProfile);

module.exports = router;

