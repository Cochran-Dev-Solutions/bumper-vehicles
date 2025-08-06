import {
  signup,
  login,
  logout,
  verify,
  resendVerification,
  getCurrentUser,
} from "../controllers/auth_controllers.js";

export const registerAuthRoutes = (fastify) => {
  // POST /signup
  fastify.post(
    "/signup",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Sign up a new user",
        description:
          "Create a new unverified user account and send verification email",
        body: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              minLength: 3,
              maxLength: 50,
              pattern: "^[a-zA-Z0-9_]+$",
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 100,
            },
            password: {
              type: "string",
              minLength: 8,
              maxLength: 255,
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  username: { type: "string" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    signup
  );

  // POST /verify
  fastify.post(
    "/verify",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Verify email address",
        description:
          "Verify email using verification code and activate account",
        body: {
          type: "object",
          required: ["email", "verification_code"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            verification_code: {
              type: "string",
              pattern: "^[0-9]{6}$",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    verify
  );

  // POST /resend-verification
  fastify.post(
    "/resend-verification",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Resend verification email",
        description: "Resend verification email to unverified user",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
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
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    resendVerification
  );

  // POST /login
  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Login user",
        description: "Authenticate user with username/email and password",
        body: {
          type: "object",
          required: ["identifier", "password"],
          properties: {
            identifier: {
              type: "string",
              description: "Username or email address",
            },
            password: {
              type: "string",
              minLength: 1,
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  email: { type: "string" },
                  display_name: { type: "string" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    login
  );

  // POST /logout
  fastify.post(
    "/logout",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Logout user",
        description: "Destroy user session and logout",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    logout
  );

  // GET /me
  fastify.get(
    "/me",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Get current user",
        description: "Get information about the currently authenticated user",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  email: { type: "string" },
                  display_name: { type: "string" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    getCurrentUser
  );
};
