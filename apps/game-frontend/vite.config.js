import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  server: {
    port: process.env.VITE_POR,
    strictPort: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      },
      "/socket.io": {
        target: process.env.VITE_API_URL,
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
        process.env.VITE_API_URL || "http://localhost:3000",
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
