import { UnverifiedUserModel } from "../models/unverified-user.model.js";
import database from "../index.js";

class UnverifiedUserDal {
  constructor() {
    this.unverifiedUserModel = new UnverifiedUserModel(
      database.getConnection()
    );
  }

  // Create new unverified user
  async createUnverifiedUser(userData) {
    try {
      const { username, email, password, verification_code, expires_at } =
        userData;

      if (
        !username ||
        !email ||
        !password ||
        !verification_code ||
        !expires_at
      ) {
        throw new Error(
          "Username, email, password, verification_code, and expires_at are required"
        );
      }

      // Create the unverified user
      const newUnverifiedUser = await this.unverifiedUserModel.create(userData);

      return {
        success: true,
        data: newUnverifiedUser,
        message: "Unverified user created successfully",
      };
    } catch (error) {
      throw new Error(`Failed to create unverified user: ${error.message}`);
    }
  }

  // Get unverified user by email
  async getUnverifiedUserByEmail(email) {
    try {
      const user = await this.unverifiedUserModel.findByEmail(email);

      if (!user) {
        return {
          success: false,
          message: "Unverified user not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(
        `Failed to get unverified user by email: ${error.message}`
      );
    }
  }

  // Get unverified user by verification code
  async getUnverifiedUserByVerificationCode(verification_code) {
    try {
      const user = await this.unverifiedUserModel.findByVerificationCode(
        verification_code
      );

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification code",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(
        `Failed to get unverified user by verification code: ${error.message}`
      );
    }
  }

  // Delete unverified user by ID
  async deleteUnverifiedUser(id) {
    try {
      const deleted = await this.unverifiedUserModel.deleteById(id);

      if (!deleted) {
        throw new Error("Failed to delete unverified user");
      }

      return {
        success: true,
        message: "Unverified user deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete unverified user: ${error.message}`);
    }
  }

  // Update verification code
  async updateVerificationCode(email, verification_code, expires_at) {
    try {
      const updated = await this.unverifiedUserModel.updateVerificationCode(
        email,
        verification_code,
        expires_at
      );

      if (!updated) {
        throw new Error("Failed to update verification code");
      }

      return {
        success: true,
        message: "Verification code updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update verification code: ${error.message}`);
    }
  }

  // Check if username exists in unverified_users
  async isUsernameInUnverifiedUsers(username) {
    try {
      return await this.unverifiedUserModel.usernameExists(username);
    } catch (error) {
      throw new Error(
        `Failed to check username in unverified users: ${error.message}`
      );
    }
  }

  // Check if email exists in unverified_users
  async isEmailInUnverifiedUsers(email) {
    try {
      return await this.unverifiedUserModel.emailExists(email);
    } catch (error) {
      throw new Error(
        `Failed to check email in unverified users: ${error.message}`
      );
    }
  }

  // Check if verification code exists and is valid
  async isVerificationCodeValid(verification_code) {
    try {
      return await this.unverifiedUserModel.verificationCodeExists(
        verification_code
      );
    } catch (error) {
      throw new Error(
        `Failed to check verification code validity: ${error.message}`
      );
    }
  }

  // Clean up expired verification codes
  async cleanupExpiredCodes() {
    try {
      const deletedCount = await this.unverifiedUserModel.cleanupExpired();
      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} expired verification codes`,
      };
    } catch (error) {
      throw new Error(`Failed to cleanup expired codes: ${error.message}`);
    }
  }
}

export { UnverifiedUserDal };
