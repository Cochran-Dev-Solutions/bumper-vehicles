import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisConnection {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      this.client.on("connect", () => {
        console.log("Redis connected successfully");
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("Redis connection failed:", error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log("Redis disconnected");
      } catch (error) {
        console.error("Error disconnecting from Redis:", error.message);
      }
    }
  }

  getRedisClient() {
    if (!this.client) {
      throw new Error("Redis not connected. Call connect() first.");
    }
    return this.client;
  }

  async testConnection() {
    try {
      const client = this.getRedisClient();
      await client.ping();
      console.log("Redis connection test successful");
      return true;
    } catch (error) {
      console.error("Redis connection test failed:", error.message);
      return false;
    }
  }
}

// Create a singleton instance
const redis = new RedisConnection();

// Export the Redis connection singleton
export default redis;

// Export the getRedisClient method
export const getRedisClient = () => redis.getRedisClient();
