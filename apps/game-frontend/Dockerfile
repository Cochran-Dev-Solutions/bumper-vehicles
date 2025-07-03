# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/game-frontend ./apps/game-frontend
COPY packages ./packages

RUN npm install -g pnpm
RUN pnpm install
WORKDIR /app/apps/game-frontend
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/game-frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 