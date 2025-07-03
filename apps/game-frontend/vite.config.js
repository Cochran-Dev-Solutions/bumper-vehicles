import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return defineConfig({
    server: {
      port: env.VITE_PORT,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_LOCAL_API_URL,
          changeOrigin: true,
        },
        "/socket.io": {
          target: env.VITE_LOCAL_API_URL,
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
          env.VITE_LOCAL_API_URL,
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
};
