const express = require("express");
const router = express.Router();
const farmerAuthRoutes = require("./farmerAuth.routes");
const ingAuthRoutes = require("./ingAuth.routes");

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
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

module.exports = router;

