import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";
import redis from "@bumper-vehicles/redis";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DB_URL
    : process.env.LOCAL_DB_URL;

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.connection = null;
  }

  async connect() {
    try {
      // Use connection pool for better performance
      this.pool = mysql.createPool({
        uri: dbUrl,
        timezone: "Z",
        dateStrings: true,
        // Pool configuration
        connectionLimit: 10,
        // Connection timeout
        connectTimeout: 60000,
        // Enable connection compression
        compress: true,
      });

      // Test the pool with a single connection
      this.connection = await this.pool.getConnection();
      await this.connection.ping();
      this.connection.release();

      console.log("Database pool connected successfully");

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

      return this.pool;
    } catch (error) {
      console.error("Database connection failed:", error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
        console.log("Database pool disconnected");
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
    if (!this.pool) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.pool;
  }

  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      await connection.execute("SELECT 1");
      connection.release();
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
