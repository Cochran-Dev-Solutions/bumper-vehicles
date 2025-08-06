import {
  sendContactFormEmail,
  sendBetaCredentialsEmail,
} from "../src/email_templates/index.js";
import BetaUserDal from "@bumper-vehicles/database/dal/beta-user.dal.js";

const betaUserDal = new BetaUserDal();

export function registerDefaultRoutes(fastify) {
  // Health check endpoint
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["Default"],
        summary: "API health check",
        description: "Check the health status of the API server",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
              uptime: { type: "number" },
              environment: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Basic health check - you can add more sophisticated checks here
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || "development",
        };

        return reply.send(healthStatus);
      } catch (error) {
        console.error("Health check error:", error);
        return reply.status(500).send({
          status: "unhealthy",
          error: error.message,
        });
      }
    }
  );

  // Contact form submission
  fastify.post(
    "/contact",
    {
      schema: {
        tags: ["Default"],
        summary: "Submit contact form",
        description:
          "Submit a contact form message (used for joining the team form)",
        body: {
          type: "object",
          required: ["name", "email", "message"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            subject: { type: "string" },
            message: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email, subject, message } = request.body;

        if (!name || !email || !message) {
          return reply
            .status(400)
            .send({ error: "Name, email, and message are required" });
        }

        // Send contact form email
        try {
          await sendContactFormEmail(name, email, subject, message);
          console.log("Contact form email sent successfully for:", {
            name,
            email,
            subject,
          });
        } catch (emailError) {
          console.error(
            "Failed to send contact form email:",
            emailError.message
          );
          return reply.status(500).send({
            error: "Failed to send message. Please try again later.",
            details: emailError.message,
          });
        }

        return reply.send({
          success: true,
          message: "Message sent successfully",
        });
      } catch (error) {
        console.error("Contact submission error:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Beta signup with PayPal payment
  fastify.post(
    "/beta-signup",
    {
      schema: {
        tags: ["Default"],
        summary: "Beta signup with payment",
        description:
          "Create a PayPal payment for beta access and redirect to payment",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              approvalUrl: { type: "string" },
              orderId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, firstName, lastName } = request.body;

        if (!email) {
          return reply.status(400).send({ error: "Email is required" });
        }

        console.log("Beta signup with payment request received:", {
          email,
          firstName,
          lastName,
        });

        // Check if user already exists
        const existingUserCheck = await betaUserDal.checkUserExists(email);
        if (existingUserCheck.exists) {
          return reply.status(400).send({
            error: "A beta account already exists for this email address.",
          });
        }

        // Import PayPal service
        const paypalService = (await import("@bumper-vehicles/payment"))
          .default;

        // Create PayPal payment
        const paymentResult = await paypalService.createPayment(
          1.0, // $1.00 beta access fee
          "USD",
          "Bumper Vehicles Beta Access Fee",
          {
            email: email,
            firstName: firstName || "",
            lastName: lastName || "",
          }
        );

        if (!paymentResult.success) {
          console.error(
            "Failed to create PayPal payment:",
            paymentResult.error
          );
          return reply.status(500).send({
            error: "Failed to create payment. Please try again.",
          });
        }

        console.log("PayPal payment created successfully:", paymentResult);

        return reply.send({
          success: true,
          approvalUrl: paymentResult.approvalUrl,
          orderId: paymentResult.orderId,
        });
      } catch (error) {
        console.error("Beta signup error:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
