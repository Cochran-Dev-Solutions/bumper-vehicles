import dotenv from "dotenv";
dotenv.config();
import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import secureSession from "@fastify/secure-session";
import { registerUserRoutes } from "./routes/user_routes.js";
import { registerAuthRoutes } from "./routes/auth_routes.js";
import { registerNewsletterRoutes } from "./routes/newsletter_routes.js";
import { registerPaymentRoutes } from "./routes/payment_routes.js";
import { registerDefaultRoutes } from "./routes/default_routes.js";
import { initializeUserDal } from "./controllers/user_controllers.js";
import { initializeAuthDal } from "./controllers/auth_controllers.js";
import database from "@bumper-vehicles/database";
import webSocketManager from "./src/game/websocket-manager.js";

const fastify = Fastify({ logger: true });

// Define allowed origins for different environments
const getGameHostUrl = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.PROD_GAME_HOST_URL || "https://app.bumpervehicles.com"
    : process.env.WEB_APP_GAME_HOST_URL || "http://localhost:5173";
};

const getLandingPageHostUrl = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.PROD_LANDING_PAGE_HOST_URL || "https://bumpervehicles.com"
    : process.env.LANDING_PAGE_HOST_URL || "http://localhost:5174";
};

// Add CORS headers
fastify.addHook("onRequest", async (request, reply) => {
  const origin = request.headers.origin;
  const gameHostUrl = getGameHostUrl();
  const landingPageHostUrl = getLandingPageHostUrl();
  
  // Allow requests from either the game frontend or landing page
  // Also handle cases where origin might be undefined (some browsers/clients)
  if (origin === gameHostUrl || origin === landingPageHostUrl || !origin) {
    // If origin is undefined, set it to the game host URL as default
    const allowedOrigin = origin || gameHostUrl;
    reply.header("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    console.log("CORS: Origin not allowed:", origin);
    console.log("CORS: Expected origins:", [gameHostUrl, landingPageHostUrl]);
  }
  
  reply.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  reply.header("Access-Control-Allow-Credentials", "true");
});

// Handle OPTIONS preflight requests
fastify.options("/*", async (request, reply) => {
  reply.send();
});

// Start the server
const start = async () => {
  try { 
    // Connect to database first
    console.log("Connecting to database...");
    await database.connect();

    // Test database connection
    await database.testConnection();

    // Initialize DALs
    initializeUserDal();
    initializeAuthDal();

    // Register secure session
    await fastify.register(secureSession, {
      secret: process.env.SESSION_SECRET,
      cookie: {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    });

    // Register Swagger plugins
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: "Bumper Vehicles API",
          description: "API documentation for the Bumper Vehicles game backend",
          version: "1.0.0",
          contact: {
            name: "API Support",
            email: "nacochranpb@gmail.com",
          },
        },
        host: "localhost:3000",
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
          {
            name: "Users",
            description: "User management endpoints",
          },
          {
            name: "Authentication",
            description: "Authentication and authorization endpoints",
          },
          {
            name: "Newsletter",
            description: "Newsletter subscription and management endpoints",
          },
          {
            name: "Payment",
            description: "Payment processing and PayPal integration endpoints",
          },
          {
            name: "Default",
            description: "General API endpoints including health checks and contact forms",
          },
          {
            name: "Marketing",
            description: "Marketing API endpoints for beta signup and landing pages",
          },
        ],
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: "/documentation",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
      },
      uiHooks: {
        onRequest: function (request, reply, next) {
          next();
        },
        preHandler: function (request, reply, next) {
          next();
        },
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });

    // Register routes after Swagger plugins
    registerUserRoutes(fastify);
    registerAuthRoutes(fastify);
    registerNewsletterRoutes(fastify);
    registerPaymentRoutes(fastify);
    registerDefaultRoutes(fastify);

    // Start the server
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
    console.log(
      "API Documentation available at: http://localhost:3000/documentation"
    );

    // Initialize WebSocket manager after Fastify server is ready
    webSocketManager.initialize(fastify.server);
    console.log("WebSocket manager started");

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      webSocketManager.shutdown();
      await database.disconnect();
      await fastify.close();
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    webSocketManager.shutdown();
    await database.disconnect();
    process.exit(1);
  }
};

start();
