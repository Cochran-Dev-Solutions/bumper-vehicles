# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/landing-page ./apps/landing-page
COPY packages ./packages

RUN npm install -g pnpm
RUN pnpm install
WORKDIR /app/apps/landing-page
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/landing-page/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 