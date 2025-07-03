# Dockerfile for game-backend
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy monorepo meta files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy app and packages
COPY apps/game-backend ./apps/game-backend
COPY packages ./packages

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies for all workspaces
RUN pnpm install

# Set working directory to backend
WORKDIR /app/apps/game-backend

# Expose backend port
EXPOSE 3000

# Start the server (environment variables are injected at runtime by ECS or Docker)
CMD ["pnpm", "start"] 