import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  getUserByUsername,
} from "../controllers/user_controllers.js";

// User schema for validation and documentation
const userSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    username: { type: "string", minLength: 3 },
    email: { type: "string", format: "email" },
    display_name: { type: "string", minLength: 1 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["username", "email", "display_name"],
};

// Response schema for user
const userResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: userSchema,
    message: { type: "string" },
  },
};

// Response schema for users array
const usersResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "array",
      items: userSchema,
    },
    count: { type: "number" },
  },
};

// Error response schema
const errorResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
  },
};

// Route options with validation schemas
const routeOptions = {
  // GET /users - Get all users
  getAllUsers: {
    schema: {
      tags: ["Users"],
      summary: "Get all users",
      description: "Retrieve a list of all users in the system",
      response: {
        200: {
          description: "List of users retrieved successfully",
          ...usersResponseSchema,
        },
      },
    },
    handler: getAllUsers,
  },

  // GET /users/:id - Get user by ID
  getUserById: {
    schema: {
      tags: ["Users"],
      summary: "Get user by ID",
      description: "Retrieve a specific user by their unique ID",
      params: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" },
        },
        required: ["id"],
      },
      response: {
        200: {
          description: "User retrieved successfully",
          ...userResponseSchema,
        },
        404: {
          description: "User not found",
          ...errorResponseSchema,
        },
      },
    },
    handler: getUserById,
  },

  // POST /users - Create new user
  createUser: {
    schema: {
      tags: ["Users"],
      summary: "Create new user",
      description: "Create a new user with the provided information",
      body: {
        type: "object",
        properties: {
          username: {
            type: "string",
            minLength: 3,
            description: "Unique username (min 3 characters)",
          },
          email: {
            type: "string",
            format: "email",
            description: "Valid email address",
          },
          display_name: {
            type: "string",
            minLength: 1,
            description: "Display name for the user",
          },
        },
        required: ["username", "email", "display_name"],
      },
      response: {
        201: {
          description: "User created successfully",
          ...userResponseSchema,
        },
      },
    },
    handler: createUser,
  },

  // PATCH /users/:id - Update user by ID
  updateUserById: {
    schema: {
      tags: ["Users"],
      summary: "Update user by ID",
      description: "Update specific fields of an existing user",
      params: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" },
        },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          username: {
            type: "string",
            minLength: 3,
            description: "New username (min 3 characters)",
          },
          email: {
            type: "string",
            format: "email",
            description: "New email address",
          },
          display_name: {
            type: "string",
            minLength: 1,
            description: "New display name",
          },
        },
      },
      response: {
        200: {
          description: "User updated successfully",
          ...userResponseSchema,
        },
        404: {
          description: "User not found",
          ...errorResponseSchema,
        },
      },
    },
    handler: updateUserById,
  },

  // DELETE /users/:id - Delete user by ID
  deleteUserById: {
    schema: {
      tags: ["Users"],
      summary: "Delete user by ID",
      description: "Remove a user from the system by their ID",
      params: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" },
        },
        required: ["id"],
      },
      response: {
        200: {
          description: "User deleted successfully",
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
        404: {
          description: "User not found",
          ...errorResponseSchema,
        },
      },
    },
    handler: deleteUserById,
  },

  // GET /users/username/:username
  getUserByUsername: {
    schema: {
      tags: ["Users"],
      summary: "Get user by username",
      description: "Retrieve a user by their username",
      params: {
        type: "object",
        properties: {
          username: { type: "string", description: "User username" },
        },
        required: ["username"],
      },
      response: {
        200: {
          description: "User retrieved successfully",
          ...userResponseSchema,
        },
        404: {
          description: "User not found",
          ...errorResponseSchema,
        },
      },
    },
    handler: getUserByUsername,
  },
};

// Register routes with Fastify
export const registerUserRoutes = (fastify) => {
  // GET /users
  fastify.get("/users", routeOptions.getAllUsers);

  // GET /users/:id
  fastify.get("/users/:id", routeOptions.getUserById);

  // POST /users
  fastify.post("/users", routeOptions.createUser);

  // PATCH /users/:id
  fastify.patch("/users/:id", routeOptions.updateUserById);

  // DELETE /users/:id
  fastify.delete("/users/:id", routeOptions.deleteUserById);

  // GET /users/username/:username
  fastify.get("/users/username/:username", routeOptions.getUserByUsername);
};
