import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";

const redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_REDIS_URL
    : process.env.LOCAL_REDIS_URL;

class RedisConnection {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          tls: true,
          checkServerIdentity: () => undefined, // disables hostname verification
        },
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
