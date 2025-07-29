import { UserModel } from "../models/user.model.js";
import database from "../index.js";

class UserDal {
  constructor() {
    this.userModel = new UserModel(database.getConnection());
  }

  // Get all users
  async getAllUsers() {
    try {
      const users = await this.userModel.findAll();

      return {
        success: true,
        data: users,
        count: users.length,
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
