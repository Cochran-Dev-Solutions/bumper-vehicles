# Setup Guide 🚀

This comprehensive guide will walk you through setting up the Bumper Vehicles development environment, from prerequisites to running the application.

## 📋 Prerequisites

### Required Software

#### 1. Node.js & pnpm

- **Node.js** (v18 or higher)
  ```bash
  # Download from https://nodejs.org/
  # Or use nvm (Node Version Manager)
  nvm install 18
  nvm use 18
  ```
- **pnpm** (v8 or higher)

  ```bash
  # Install pnpm globally
  npm install -g pnpm@latest

  # Verify installation
  pnpm --version
  ```

#### 2. MySQL Database

- **MySQL** (v8.0 or higher)

  ```bash
  # macOS (using Homebrew)
  brew install mysql
  brew services start mysql

  # Ubuntu/Debian
  sudo apt update
  sudo apt install mysql-server
  sudo systemctl start mysql

  # Windows
  # Download from https://dev.mysql.com/downloads/mysql/
  ```

#### 3. Git

- **Git** (latest version)

  ```bash
  # macOS
  brew install git

  # Ubuntu/Debian
  sudo apt install git

  # Windows
  # Download from https://git-scm.com/
  ```

#### 4. Code Editor

- **VS Code** (recommended)
  - Download from https://code.visualstudio.com/
  - Install recommended extensions:
    - ESLint
    - Prettier
    - JavaScript and TypeScript
    - React Developer Tools

### Optional Software

#### 1. Docker (for containerized development)

```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
sudo apt install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# Windows
# Download from https://www.docker.com/products/docker-desktop
```

#### 2. Redis (for future caching features)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Using Docker
docker run -d --name redis -p 6379:6379 redis
```

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/bumper-vehicles.git
cd bumper-vehicles

# Verify the structure
ls -la
```

### Step 2: Install Dependencies

```bash
# Install all dependencies using pnpm workspaces
pnpm install

# This will install dependencies for:
# - Root workspace
# - apps/server
# - apps/landing-page
# - apps/web-client
# - apps/mobile-client
# - packages/client-logic
# - packages/database
# - packages/mailer
# - packages/payment
# - packages/redis
```

### Step 3: Database Setup

#### Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE bumper_vehicles;
CREATE DATABASE bumper_vehicles_test;

# Create user (optional)
CREATE USER 'bumper_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON bumper_vehicles.* TO 'bumper_user'@'localhost';
GRANT ALL PRIVILEGES ON bumper_vehicles_test.* TO 'bumper_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Run Database Scripts

```bash
# Run main database schema
mysql -u root -p bumper_vehicles < packages/database/scripts/main.sql

# Run additional scripts if available
mysql -u root -p bumper_vehicles < packages/database/scripts/email_marketing_beta.sql
```

### Step 4: Environment Configuration

#### Backend Environment (`apps/server/.env`)

```bash
# Copy example file
cp apps/server/env.example.development apps/server/.env

# Edit the file with your configuration
nano apps/server/.env
```

**Required Environment Variables**:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Client URLs
WEB_APP_GAME_HOST_URL=http://localhost:5173
LANDING_PAGE_HOST_URL=http://localhost:5174
API_URL=http://localhost:3000

# Database Configuration
LOCAL_DB_URL=mysql://username:password@localhost:3306/bumper_vehicles

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ConvertKit Configuration
CONVERTKIT_API_KEY=your-convertkit-api-key
CONVERTKIT_FORM_ID=your-form-id
```

#### Frontend Environment (`apps/landing-page/.env`)

```bash
# Copy example file
cp apps/landing-page/env.example apps/landing-page/.env

# Edit the file
nano apps/landing-page/.env
```

**Required Environment Variables**:

```env
VITE_APP_TITLE=Bumper-Vehicles-App
VITE_PORT=5174
VITE_LOCAL_API_URL=http://localhost:3000
VITE_PROD_API_URL=https://api.bumpervehicles.com
VITE_LOCAL_GAME_URL=http://localhost:5173
VITE_PROD_GAME_URL=https://app.bumpervehicles.com
```

### Step 5: Verify Installation

```bash
# Test database connection
cd apps/server
pnpm dev

# In another terminal, test the API
curl http://localhost:3000/health
```

## 🎮 Running the Application

### Development Mode

#### 1. Start the Backend Server

```bash
# Terminal 1: Start backend server
cd apps/server
pnpm dev

# Server should start on http://localhost:3000
# API documentation available at http://localhost:3000/documentation
```

#### 2. Start the Landing Page

```bash
# Terminal 2: Start landing page
cd apps/landing-page
pnpm dev

# Landing page should start on http://localhost:5174
```

#### 3. Start the Web Game Client

```bash
# Terminal 3: Start web game client
cd apps/web-client
pnpm dev

# Game client should start on http://localhost:5173
```

#### 4. Start Mobile Client (Optional)

```bash
# Terminal 4: Start mobile client
cd apps/mobile-client
pnpm start

# This will start Expo development server
# Follow instructions to open on device or simulator
```

### Production Mode

#### Build Applications

```bash
# Build landing page
cd apps/landing-page
pnpm build

# Build web client
cd apps/web-client
pnpm build

# Build server (if needed)
cd apps/server
pnpm build
```

#### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.local.yml up --build
```

## 🔧 Development Workflow

### Code Quality Tools

#### ESLint Configuration

The project uses ESLint for code quality:

```bash
# Run linting across all packages
pnpm lint

# Run linting for specific app
cd apps/server && pnpm lint
cd apps/landing-page && pnpm lint
cd apps/web-client && pnpm lint
```

#### Pre-commit Hooks

```bash
# Install pre-commit hooks (if configured)
pnpm install
# Hooks will run automatically on commit
```

### Development Best Practices

#### 1. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-game-mode

# Make changes and commit
git add .
git commit -m "feat: add new game mode"

# Push and create pull request
git push origin feature/new-game-mode
```

#### 2. Package Development

```bash
# Work on shared packages
cd packages/client-logic
# Make changes to shared logic

# Test changes in dependent apps
cd apps/web-client
pnpm dev
```

#### 3. Database Changes

```bash
# Create new migration
cd packages/database/scripts
# Create new SQL file

# Apply migration
mysql -u root -p bumper_vehicles < new_migration.sql
```

### Testing

#### Unit Tests

```bash
# Run tests (when implemented)
pnpm test

# Run tests for specific package
cd packages/client-logic && pnpm test
```

#### Integration Tests

```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/users
```

#### Manual Testing

1. **Landing Page**: Visit http://localhost:5174
2. **Game Client**: Visit http://localhost:5173
3. **API Documentation**: Visit http://localhost:3000/documentation

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check MySQL service
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check connection
mysql -u root -p -e "SELECT 1;"
```

#### 2. Port Conflicts

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5173
lsof -i :5174

# Kill process if needed
kill -9 <PID>
```

#### 3. pnpm Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### 4. Environment Variables

```bash
# Verify environment files exist
ls -la apps/server/.env
ls -la apps/landing-page/.env

# Check variable loading
cd apps/server
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

### Debug Mode

#### Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=*

# Or add to .env file
DEBUG=*
```

#### Database Debugging

```bash
# Enable MySQL query logging
mysql -u root -p
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
```

## 📊 Performance Optimization

### Development Performance

#### 1. Use pnpm for Faster Installs

```bash
# pnpm is significantly faster than npm
pnpm install  # vs npm install
```

#### 2. Enable Vite HMR

```bash
# Vite provides fast hot module replacement
# Changes reflect immediately in browser
```

#### 3. Database Connection Pooling

```bash
# Connection pooling is configured in database package
# Adjust pool size in packages/database/index.js
```

### Production Performance

#### 1. Build Optimization

```bash
# Optimize builds
cd apps/landing-page
pnpm build --mode production

cd apps/web-client
pnpm build --mode production
```

#### 2. Docker Optimization

```bash
# Use multi-stage builds
# Optimize Docker images for production
```

## 🔒 Security Considerations

### Development Security

#### 1. Environment Variables

- Never commit `.env` files
- Use `.env.example` files for templates
- Rotate secrets regularly

#### 2. Database Security

```bash
# Use strong passwords
# Limit database user privileges
# Enable SSL connections in production
```

#### 3. API Security

- Validate all inputs
- Use HTTPS in production
- Implement rate limiting

### Production Security

#### 1. SSL/TLS

```bash
# Use HTTPS in production
# Configure SSL certificates
```

#### 2. Firewall Configuration

```bash
# Only expose necessary ports
# Configure firewall rules
```

## 📚 Additional Resources

### Documentation

- [Technology Stack](./technology-stack.md)
- [System Architecture](./system-architecture.md)
- [API Documentation](./api-documentation.md)

### External Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [pnpm Documentation](https://pnpm.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Vite Documentation](https://vitejs.dev/)

### Community Support

- [Discord Server](https://discord.gg/bumpervehicles)
- [GitHub Issues](https://github.com/your-username/bumper-vehicles/issues)
- [Project Wiki](https://github.com/your-username/bumper-vehicles/wiki)

---

_This setup guide provides everything needed to get started with Bumper Vehicles development. For additional help, join our Discord community or check the project wiki._
