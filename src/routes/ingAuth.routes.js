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
 *                     ing:
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
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Engineer registered successfully"
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
 *       409:
 *         description: Email or username already exists
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
 *                   example: "Engineer with this email already exists"
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
 *                     ing:
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
 *                   example: "Engineer logged in successfully"
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
 *                   example: "Engineer profile retrieved successfully"
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
router.get("/profile", authenticateIng, ingAuthController.getProfile);

module.exports = router;

