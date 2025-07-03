import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Select the correct API URL based on VITE_NODE_ENV
const isProduction = process.env.VITE_NODE_ENV === "production";
const apiUrl = isProduction
  ? process.env.VITE_PROD_API_URL
  : process.env.VITE_LOCAL_API_URL;

export default defineConfig({
  server: {
    port: process.env.VITE_PORT,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
      },
      "/socket.io": {
        target: apiUrl,
        changeOrigin: true,
        ws: true,
      },
    },
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
    cors: {
      origin: [
        `http://localhost:${process.env.VITE_PORT}`,
        apiUrl || "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
