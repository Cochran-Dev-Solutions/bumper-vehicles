# DevOps 🚀

This document covers the DevOps infrastructure, deployment strategies, and operational procedures for the Bumper Vehicles project.

## 🏗️ Infrastructure Overview

### Technology Stack

- **CI/CD**: GitHub Actions
- **Containerization**: Docker & Docker Compose
- **Cloud Platform**: AWS (EC2, RDS, S3, ECR)
- **Build Tools**: Vite, pnpm
- **Monitoring**: AWS CloudWatch
- **Version Control**: Git & GitHub

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing, building, and deployment.

#### Workflow Structure

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: apps/*/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      - name: Build and push Docker image
        run: |
          docker build -f apps/server/Dockerfile -t ${{ steps.login-ecr.outputs.registry }}/bumper-backend:${{ github.sha }} .
          docker push ${{ steps.login-ecr.outputs.registry }}/bumper-backend:${{ github.sha }}
```

### Pipeline Stages

#### 1. Test Stage

- **Linting**: ESLint checks across all packages
- **Unit Tests**: Run test suites (when implemented)
- **Integration Tests**: API endpoint testing
- **Security Scans**: Dependency vulnerability checks

#### 2. Build Stage

- **Frontend Builds**: Vite builds for landing page and web client
- **Backend Build**: Node.js application packaging
- **Asset Optimization**: Image compression and optimization
- **Artifact Creation**: Build artifacts for deployment

#### 3. Deploy Stage

- **Docker Image Build**: Create production-ready containers
- **ECR Push**: Upload images to AWS ECR
- **ECS Deployment**: Deploy to AWS ECS (or EC2)
- **Health Checks**: Verify deployment success

### Environment Management

#### Development Environment

```yaml
# Development deployment
environment: development
variables:
  NODE_ENV: development
  DATABASE_URL: dev-db-url
  API_URL: https://dev-api.bumpervehicles.com
```

#### Staging Environment

```yaml
# Staging deployment
environment: staging
variables:
  NODE_ENV: staging
  DATABASE_URL: staging-db-url
  API_URL: https://staging-api.bumpervehicles.com
```

#### Production Environment

```yaml
# Production deployment
environment: production
variables:
  NODE_ENV: production
  DATABASE_URL: prod-db-url
  API_URL: https://api.bumpervehicles.com
```

## 🐳 Docker Configuration

### Backend Dockerfile

```dockerfile
# apps/server/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["pnpm", "start"]
```

### Frontend Dockerfile

```dockerfile
# apps/landing-page/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

```yaml
# docker-compose.local.yml
version: "3.8"

services:
  backend:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: mysql://root:password@db:3306/bumper_vehicles
    depends_on:
      - db
    volumes:
      - ./apps/server:/app/apps/server
      - /app/node_modules

  frontend:
    build:
      context: .
      dockerfile: apps/landing-page/Dockerfile
    ports:
      - "5174:80"
    depends_on:
      - backend

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: bumper_vehicles
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  backend:
    image: 473548817874.dkr.ecr.us-east-2.amazonaws.com/bumper-backend:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
```

## ☁️ AWS Infrastructure

### AWS Services Used

#### 1. EC2 (Elastic Compute Cloud)

- **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
- **AMI**: Amazon Linux 2
- **Security Groups**: Configured for web traffic
- **Auto Scaling**: Based on CPU/memory usage

#### 2. RDS (Relational Database Service)

- **Engine**: MySQL 8.0
- **Instance Type**: db.t3.micro (development)
- **Multi-AZ**: Enabled for production
- **Backup**: Automated daily backups

#### 3. S3 (Simple Storage Service)

- **Static Assets**: Game images and assets
- **CDN**: CloudFront distribution
- **Backup Storage**: Database backups

#### 4. ECR (Elastic Container Registry)

- **Repository**: bumper-backend
- **Image Tags**: Latest, versioned tags
- **Lifecycle Policy**: Clean up old images

#### 5. CloudWatch

- **Monitoring**: Application metrics
- **Logging**: Centralized log collection
- **Alarms**: Performance and error alerts

### Infrastructure as Code (IaC)

#### Terraform Configuration

```hcl
# infrastructure/main.tf
provider "aws" {
  region = "us-east-2"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "bumper-vehicles-vpc"
  }
}

# EC2 Instance
resource "aws_instance" "backend" {
  ami           = "ami-0c02fb55956c7d323"
  instance_type = "t3.medium"

  vpc_security_group_ids = [aws_security_group.backend.id]
  subnet_id              = aws_subnet.main.id

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Name = "bumper-backend"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "bumper-vehicles-db"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  storage_encrypted     = true
  storage_type         = "gp2"

  db_name  = "bumper_vehicles"
  username = "admin"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"

  tags = {
    Name = "bumper-vehicles-database"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "assets" {
  bucket = "bumper-vehicles-assets"

  tags = {
    Name = "bumper-vehicles-assets"
  }
}

# ECR Repository
resource "aws_ecr_repository" "backend" {
  name = "bumper-backend"

  image_scanning_configuration {
    scan_on_push = true
  }
}
```

### Security Groups

```hcl
# Backend Security Group
resource "aws_security_group" "backend" {
  name_prefix = "bumper-backend-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## 🔄 Deployment Strategies

### Blue-Green Deployment

```bash
#!/bin/bash
# deploy-blue-green.sh

# Deploy new version to green environment
echo "Deploying to green environment..."
docker-compose -f docker-compose.green.yml up -d

# Run health checks
echo "Running health checks..."
for i in {1..30}; do
  if curl -f http://green-api.bumpervehicles.com/health; then
    echo "Green deployment healthy"
    break
  fi
  sleep 2
done

# Switch traffic to green
echo "Switching traffic to green..."
aws elbv2 modify-listener \
  --listener-arn $BLUE_LISTENER_ARN \
  --default-action Type=forward,TargetGroupArn=$GREEN_TARGET_GROUP_ARN

# Terminate blue environment
echo "Terminating blue environment..."
docker-compose -f docker-compose.blue.yml down
```

### Rolling Deployment

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bumper-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: bumper-backend
  template:
    metadata:
      labels:
        app: bumper-backend
    spec:
      containers:
        - name: backend
          image: bumper-backend:latest
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## 📊 Monitoring & Observability

### CloudWatch Metrics

```javascript
// Custom metrics in application
const AWS = require("aws-sdk");
const cloudwatch = new AWS.CloudWatch();

// Track game metrics
const trackGameMetrics = (gameId, playerCount, gameDuration) => {
  cloudwatch
    .putMetricData({
      Namespace: "BumperVehicles/Game",
      MetricData: [
        {
          MetricName: "ActiveGames",
          Value: 1,
          Unit: "Count",
        },
        {
          MetricName: "PlayerCount",
          Value: playerCount,
          Unit: "Count",
        },
        {
          MetricName: "GameDuration",
          Value: gameDuration,
          Unit: "Seconds",
        },
      ],
    })
    .send();
};
```

### Logging Strategy

```javascript
// Structured logging
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "bumper-backend" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Log game events
logger.info("Game started", {
  gameId: "game_123",
  playerCount: 4,
  gameType: "race",
  timestamp: new Date().toISOString(),
});
```

### Health Checks

```javascript
// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await database.testConnection();

    // Check Redis connection (if used)
    // await redis.ping();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

## 🔒 Security

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name bumpervehicles.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bumpervehicles.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Headers

```javascript
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "https://bumpervehicles.com",
    ],
    credentials: true,
  })
);
```

## 📈 Performance Optimization

### CDN Configuration

```javascript
// CloudFront distribution
const cloudfrontConfig = {
  DistributionConfig: {
    CallerReference: Date.now().toString(),
    Comment: "Bumper Vehicles CDN",
    DefaultCacheBehavior: {
      TargetOriginId: "S3-bumper-vehicles-assets",
      ViewerProtocolPolicy: "redirect-to-https",
      MinTTL: 0,
      DefaultTTL: 86400,
      MaxTTL: 31536000,
      ForwardedValues: {
        QueryString: false,
        Cookies: { Forward: "none" },
      },
    },
    Origins: {
      Quantity: 1,
      Items: [
        {
          Id: "S3-bumper-vehicles-assets",
          DomainName: "bumper-vehicles-assets.s3.amazonaws.com",
          S3OriginConfig: {
            OriginAccessIdentity: "",
          },
        },
      ],
    },
  },
};
```

### Database Optimization

```sql
-- Database indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_games_state ON games(state);
CREATE INDEX idx_players_game_id ON players(game_id);

-- Connection pooling configuration
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
```

## 🚨 Incident Response

### Monitoring Alerts

```javascript
// CloudWatch alarms
const alarms = [
  {
    AlarmName: "HighCPUUtilization",
    MetricName: "CPUUtilization",
    Threshold: 80,
    Period: 300,
    EvaluationPeriods: 2,
  },
  {
    AlarmName: "HighMemoryUtilization",
    MetricName: "MemoryUtilization",
    Threshold: 85,
    Period: 300,
    EvaluationPeriods: 2,
  },
  {
    AlarmName: "DatabaseConnections",
    MetricName: "DatabaseConnections",
    Threshold: 100,
    Period: 300,
    EvaluationPeriods: 1,
  },
];
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Database backup
mysqldump -u $DB_USER -p$DB_PASS bumper_vehicles > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://bumper-vehicles-backups/

# Clean up old backups (keep 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
```

---

_This DevOps infrastructure provides a robust, scalable, and secure foundation for the Bumper Vehicles application with automated deployment, monitoring, and disaster recovery capabilities._
