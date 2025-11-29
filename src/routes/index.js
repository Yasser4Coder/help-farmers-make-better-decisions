const express = require("express");
const router = express.Router();
const farmerAuthRoutes = require("./farmerAuth.routes");
const ingAuthRoutes = require("./ingAuth.routes");
const notificationRoutes = require("./notification.routes");
const weatherRoutes = require("./weather.routes");
const farmerRoutes = require("./farmer.routes");
const soilRoutes = require("./soil.routes");
const overviewRoutes = require("./overview.routes");

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
router.use("/auth/farmer", farmerAuthRoutes);
router.use("/auth/ing", ingAuthRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

// Weather routes
router.use("/weather", weatherRoutes);

// Farmer routes
router.use("/farmers", farmerRoutes);

// Soil routes
router.use("/soil", soilRoutes);

// Overview routes
router.use("/overview", overviewRoutes);

module.exports = router;

