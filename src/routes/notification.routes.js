const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const notificationValidation = require("../validations/notification.validation");
const validate = require("../middlewares/validate.middleware");
const { authenticateFarmer, authenticateIng } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Firebase Cloud Messaging notification endpoints
 */

/**
 * @swagger
 * /api/notifications/device:
 *   post:
 *     summary: Send notification to a single device
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *               - notification
 *             properties:
 *               fcmToken:
 *                 type: string
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     messageId:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Notification sent successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or invalid token
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
 *                   example: "FCM token is required"
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to send notification"
 *       503:
 *         description: Firebase not initialized
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
 *                   example: 503
 *                 message:
 *                   type: string
 *                   example: "Firebase not initialized. Push notifications are disabled."
 */
router.post(
  "/device",
  validate(notificationValidation.sendToDevice),
  notificationController.sendToDevice
);

/**
 * @swagger
 * /api/notifications/multiple:
 *   post:
 *     summary: Send notification to multiple devices
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmTokens
 *               - notification
 *             properties:
 *               fcmTokens:
 *                 type: array
 *                 items:
 *                   type: string
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notifications sent successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     successCount:
 *                       type: integer
 *                       example: 5
 *                     failureCount:
 *                       type: integer
 *                       example: 1
 *                     responses:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *                   example: "Notifications sent successfully"
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
 *                   example: "At least one FCM token is required"
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 */
router.post(
  "/multiple",
  validate(notificationValidation.sendToMultipleDevices),
  notificationController.sendToMultipleDevices
);

/**
 * @swagger
 * /api/notifications/farmers/all:
 *   post:
 *     summary: Send notification to all farmers
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification
 *             properties:
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notifications sent to all farmers successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     successCount:
 *                       type: integer
 *                       example: 10
 *                     failureCount:
 *                       type: integer
 *                       example: 0
 *                     message:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: "Notifications sent to all farmers successfully"
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
 *       503:
 *         description: Firebase not initialized
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
 *                   example: 503
 *                 message:
 *                   type: string
 */
router.post(
  "/farmers/all",
  authenticateIng, // Only engineers can send to all farmers
  validate(notificationValidation.sendToAll),
  notificationController.sendToAllFarmers
);

/**
 * @swagger
 * /api/notifications/engineers/all:
 *   post:
 *     summary: Send notification to all engineers
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification
 *             properties:
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notifications sent to all engineers successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     successCount:
 *                       type: integer
 *                       example: 5
 *                     failureCount:
 *                       type: integer
 *                       example: 0
 *                     message:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: "Notifications sent to all engineers successfully"
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
 *       503:
 *         description: Firebase not initialized
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
 *                   example: 503
 *                 message:
 *                   type: string
 */
router.post(
  "/engineers/all",
  authenticateIng, // Only engineers can send to all engineers
  validate(notificationValidation.sendToAll),
  notificationController.sendToAllEngineers
);

/**
 * @swagger
 * /api/notifications/farmer/{farmerId}:
 *   post:
 *     summary: Send notification to specific farmer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Farmer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification
 *             properties:
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     messageId:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Notification sent to farmer successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or invalid token
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
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 */
router.post(
  "/farmer/:farmerId",
  authenticateIng, // Only engineers can send to specific farmers
  validate(notificationValidation.sendToUser),
  notificationController.sendToFarmer
);

/**
 * @swagger
 * /api/notifications/engineer/{engineerId}:
 *   post:
 *     summary: Send notification to specific engineer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: engineerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Engineer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification
 *             properties:
 *               notification:
 *                 type: object
 *                 required:
 *                   - title
 *                   - body
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   image:
 *                     type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     messageId:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Notification sent to engineer successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or invalid token
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
 *       404:
 *         description: Engineer not found
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
 *                   example: "Engineer not found"
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 */
router.post(
  "/engineer/:engineerId",
  authenticateIng,
  validate(notificationValidation.sendToUser),
  notificationController.sendToEngineer
);

/**
 * @swagger
 * /api/notifications/farmer/token:
 *   put:
 *     summary: Update FCM token for current farmer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *     responses:
 *       200:
 *         description: FCM token updated successfully
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
 *                     farmerId:
 *                       type: integer
 *                     fcmToken:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "FCM token updated successfully"
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
 *                   example: "FCM token is required"
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
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 */
router.put(
  "/farmer/token",
  authenticateFarmer,
  validate(notificationValidation.updateToken),
  notificationController.updateFarmerToken
);

/**
 * @swagger
 * /api/notifications/engineer/token:
 *   put:
 *     summary: Update FCM token for current engineer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *     responses:
 *       200:
 *         description: FCM token updated successfully
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
 *                     engineerId:
 *                       type: integer
 *                     fcmToken:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "FCM token updated successfully"
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
 *                   example: "FCM token is required"
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
 *       500:
 *         description: Internal server error
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
 *                   example: 500
 *                 message:
 *                   type: string
 */
router.put(
  "/engineer/token",
  authenticateIng,
  validate(notificationValidation.updateToken),
  notificationController.updateEngineerToken
);

module.exports = router;
