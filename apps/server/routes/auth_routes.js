import {
  signup,
  login,
  logout,
  verify,
  resendVerification,
  getCurrentUser,
} from "../controllers/auth_controllers.js";

export const registerAuthRoutes = fastify => {
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

  // POST /beta-auth
  fastify.post(
    "/beta-auth",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Authenticate beta user",
        description: "Authenticate a beta user with username and password",
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              description: "Beta user username",
            },
            password: {
              type: "string",
              description: "Beta user password",
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
                  firstName: { type: "string" },
                  lastName: { type: "string" },
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
    async (request, reply) => {
      try {
        const { username, password } = request.body;

        if (!username || !password) {
          return reply.status(400).send({
            success: false,
            message: "Username and password are required",
          });
        }

        // Import BetaUserDal here to avoid circular dependencies
        const BetaUserDal = (
          await import("@bumper-vehicles/database/dal/beta-user.dal.js")
        ).default;
        const betaUserDal = new BetaUserDal();

        // Verify beta user credentials
        const result = await betaUserDal.verifyBetaUser(username, password);

        if (!result.success) {
          return reply.status(401).send({
            success: false,
            message: "Invalid username or password",
          });
        }

        // Set a session cookie for beta authentication
        reply.setCookie("beta_auth", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return reply.send({
          success: true,
          message: "Beta authentication successful",
          data: result.user,
        });
      } catch (error) {
        console.error("Beta authentication error:", error);
        return reply.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );

  // GET /beta-auth/check
  fastify.get(
    "/beta-auth/check",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Check beta authentication status",
        description: "Check if the user is authenticated as a beta user",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              authenticated: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  email: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const betaAuthCookie = request.cookies.beta_auth;

        if (!betaAuthCookie) {
          return reply.send({
            success: true,
            authenticated: false,
          });
        }

        // For now, just check if the cookie exists
        // In a more secure implementation, you might want to verify the session
        return reply.send({
          success: true,
          authenticated: true,
        });
      } catch (error) {
        console.error("Beta auth check error:", error);
        return reply.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
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
