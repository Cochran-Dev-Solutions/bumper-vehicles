import mysql from "mysql2/promise";
import dotenv from "dotenv";
import redis from "@bumper-vehicles/redis";

dotenv.config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        uri: process.env.DB_URL,
        timezone: "Z",
        dateStrings: true,
      });

      console.log("Database connected successfully");

      // Also connect to Redis
      try {
        await redis.connect();
        console.log("Redis connection initialized");
      } catch (redisError) {
        console.warn(
          "Redis connection failed, continuing without cache:",
          redisError.message
        );
      }

      return this.connection;
    } catch (error) {
      console.error("Database connection failed:", error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.end();
        console.log("Database disconnected");
      } catch (error) {
        console.error("Error disconnecting from database:", error.message);
      }
    }

    // Also disconnect from Redis
    try {
      await redis.disconnect();
    } catch (redisError) {
      console.warn("Error disconnecting from Redis:", redisError.message);
    }
  }

  getConnection() {
    if (!this.connection) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.connection;
  }

  async testConnection() {
    try {
      const connection = this.getConnection();
      await connection.execute("SELECT 1");
      console.log("Database connection test successful");
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error.message);
      return false;
    }
  }
}

// Create a singleton instance
const database = new DatabaseConnection();

// Export the database connection singleton
export default database;

// Export DAL and Model classes
export { UserDal } from "./dal/user.dal.js";
export { UserModel } from "./models/user.model.js";
export { UnverifiedUserDal } from "./dal/unverified-user.dal.js";
export { UnverifiedUserModel } from "./models/unverified-user.model.js";
