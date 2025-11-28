const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logger = require("./config/logger");
const routes = require("./routes");
const {
  errorConverter,
  errorHandler,
} = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

// Load environment variables
require("dotenv").config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Algeria20 Backend API",
      version: "1.0.0",
      description: "Backend API documentation using Swagger",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "https://help-farmers-make-better-decisions.onrender.com",
        description: "Production server",
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Algeria20 API Documentation",
  })
);

// API routes
app.use("/api", apiLimiter, routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Algeria20 Backend API",
    documentation: "/api-docs",
    health: "/api/health",
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
