import { UserModel } from "../models/user.model.js";
import database from "../index.js";
import { getRedisClient } from "@bumper-vehicles/redis";

class UserDal {
  constructor() {
    this.userModel = new UserModel(database.getConnection());
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = getRedisClient();
    } catch (error) {
      console.warn("Redis not available for caching:", error.message);
      this.redisClient = null;
    }
  }

  // Invalidate cache when data changes
  async invalidateCache() {
    if (this.redisClient) {
      try {
        await this.redisClient.del("all_users");
        console.log("Cache invalidated");
      } catch (redisError) {
        console.warn("Failed to invalidate cache:", redisError.message);
      }
    }
  }

  // Get all users with Redis caching
  async getAllUsers() {
    try {
      // Try to get from cache first
      if (this.redisClient) {
        try {
          const cachedUsers = await this.redisClient.get("all_users");
          if (cachedUsers) {
            console.log("Returning cached users");
            return {
              success: true,
              data: JSON.parse(cachedUsers),
              count: JSON.parse(cachedUsers).length,
              cached: true,
            };
          }
        } catch (redisError) {
          console.warn("Redis cache error:", redisError.message);
        }
      }

      // If not in cache, get from database
      const users = await this.userModel.findAll();

      // Cache the result for 5 minutes (300 seconds)
      if (this.redisClient) {
        try {
          await this.redisClient.setEx("all_users", 300, JSON.stringify(users));
          console.log("Cached users in Redis");
        } catch (redisError) {
          console.warn("Failed to cache users:", redisError.message);
        }
      }

      return {
        success: true,
        data: users,
        count: users.length,
        cached: false,
      };
    } catch (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Validate required fields
      const { username, email, display_name, password } = userData;

      if (!username || !email || !display_name || !password) {
        throw new Error(
          "Username, email, display_name, and password are required"
        );
      }

      // Check if username already exists
      const usernameExists = await this.userModel.usernameExists(username);
      if (usernameExists) {
        throw new Error("Username already exists");
      }

      // Check if email already exists
      const emailExists = await this.userModel.emailExists(email);
      if (emailExists) {
        throw new Error("Email already exists");
      }

      // Create the user
      const newUser = await this.userModel.create(userData);

      // Invalidate cache since we added a new user
      await this.invalidateCache();

      return {
        success: true,
        data: newUser,
        message: "User created successfully",
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Update user by ID
  async updateUser(id, updateData) {
    try {
      // Check if user exists
      const existingUser = await this.userModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Validate update data
      const { username, email } = updateData;

      // Check if username is being updated and if it already exists
      if (username && username !== existingUser.username) {
        const usernameExists = await this.userModel.usernameExists(
          username,
          id
        );
        if (usernameExists) {
          throw new Error("Username already exists");
        }
      }

      // Check if email is being updated and if it already exists
      if (email && email !== existingUser.email) {
        const emailExists = await this.userModel.emailExists(email, id);
        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Update the user
      const updatedUser = await this.userModel.updateById(id, updateData);

      // Invalidate cache since we updated a user
      await this.invalidateCache();

      return {
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user by ID
  async deleteUser(id) {
    try {
      // Check if user exists
      const existingUser = await this.userModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Delete the user
      const deleted = await this.userModel.deleteById(id);

      if (!deleted) {
        throw new Error("Failed to delete user");
      }

      // Invalidate cache since we deleted a user
      await this.invalidateCache();

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Get user by username (for authentication purposes)
  async getUserByUsername(username) {
    try {
      const user = await this.userModel.findByUsername(username);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(`Failed to get user by username: ${error.message}`);
    }
  }

  // Get user by email (for authentication purposes)
  async getUserByEmail(email) {
    try {
      const user = await this.userModel.findByEmail(email);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  // Check if username exists (for validation)
  async isUsernameAvailable(username, excludeId = null) {
    try {
      const exists = await this.userModel.usernameExists(username, excludeId);
      return !exists;
    } catch (error) {
      throw new Error(
        `Failed to check username availability: ${error.message}`
      );
    }
  }

  // Check if email exists (for validation)
  async isEmailAvailable(email, excludeId = null) {
    try {
      const exists = await this.userModel.emailExists(email, excludeId);
      return !exists;
    } catch (error) {
      throw new Error(`Failed to check email availability: ${error.message}`);
    }
  }

  // Get user by username or email (for login)
  async getUserByUsernameOrEmail(identifier) {
    try {
      const user = await this.userModel.findByUsernameOrEmail(identifier);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(
        `Failed to get user by username or email: ${error.message}`
      );
    }
  }
}

export { UserDal };
