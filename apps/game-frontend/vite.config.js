import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Select the correct API URL based on VITE_NODE_ENV
const isProduction = process.env.VITE_NODE_ENV === "production";
const apiUrl = isProduction
  ? process.env.VITE_PROD_API_URL
  : process.env.VITE_LOCAL_API_URL;

export default defineConfig({
  resolve: {
    alias: {
      '@bv-frontend-logic': path.resolve(__dirname, '../../packages/bv-frontend-logic/src'),
    },
  },
  server: {
    port: 5173, // Hardcoded port for consistency
    strictPort: true, // Fail if port is occupied instead of trying another port
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
        "http://localhost:5173", // Hardcoded for consistency
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
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  publicDir: "public",
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
});
