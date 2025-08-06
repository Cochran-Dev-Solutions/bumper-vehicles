# Technology Stack 🛠️

This document provides a comprehensive overview of all technologies used in the Bumper Vehicles project, organized by their role in the system.

## 🏗️ Monorepo Architecture

### Package Manager

- **pnpm** - Fast, disk space efficient package manager
- **Workspaces** - Monorepo management with `pnpm-workspace.yaml`
- **Cross-platform** - Consistent dependency management across all apps

### Development Tools

- **ESLint** - Code linting and style enforcement
- **Vite** - Fast build tool for frontend applications
- **Cross-env** - Environment variable management across platforms

## 🖥️ Backend Technologies

### Core Runtime

- **Node.js** - JavaScript runtime environment
- **ES Modules** - Modern JavaScript module system (`"type": "module"`)

### Web Framework

- **Fastify** - High-performance web framework
  - **@fastify/cors** - Cross-origin resource sharing
  - **@fastify/secure-session** - Secure session management
  - **@fastify/swagger** - API documentation generation
  - **@fastify/swagger-ui** - Interactive API documentation

### Database

- **MySQL** - Relational database management system
- **mysql2** - MySQL client for Node.js with promise support
- **Connection Pooling** - Optimized database connections

### Authentication & Security

- **bcryptjs** - Password hashing and verification
- **Secure Sessions** - Encrypted session management
- **CORS Configuration** - Cross-origin request handling

## 🎮 Game Technologies

### Real-time Communication

- **Socket.IO** - Real-time bidirectional communication
- **WebSocket** - Low-latency client-server communication

### Physics Engine

- **Custom Physics System** - Built-in physics engine
- **Bounding Box Collision** - Efficient collision detection
- **Tile Map System** - Grid-based spatial optimization

### Game Logic

- **Entity-Component System** - Modular game object architecture
- **State Management** - Synchronized game state across clients
- **Actor System** - Frontend-backend entity mapping

## 🌐 Frontend Technologies

### Web Client (Desktop)

- **p5.js** - Creative coding library for canvas rendering
- **Vite** - Fast development server and build tool
- **ESLint** - Code quality enforcement

### Mobile Client

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **@shopify/react-native-skia** - High-performance 2D graphics
- **React Native Reanimated** - Smooth animations

### Landing Page

- **React** - Component-based UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefixing

## 📦 Shared Packages

### Client Logic Package

- **Cross-platform Logic** - Shared game logic between web and mobile
- **Event Management** - Input handling and scene management
- **Rendering Abstraction** - Platform-agnostic rendering interface
- **Networking** - WebSocket communication layer

### Database Package

- **Data Access Layer (DAL)** - Database abstraction layer
- **Models** - Data structure definitions
- **Connection Management** - Database connection pooling
- **Migration Scripts** - Database schema management

### Mailer Package

- **Nodemailer** - Email sending functionality
- **Template System** - HTML email templates
- **Verification Codes** - Email verification system
- **Marketing Integration** - ConvertKit integration

### Payment Package

- **PayPal Integration** - Payment processing
- **Webhook Handling** - Payment notification processing
- **Order Management** - Payment state tracking

### Redis Package (Future)

- **Caching** - Session and data caching
- **Real-time Features** - Pub/sub messaging
- **Performance Optimization** - High-speed data storage

## 🔧 Development & DevOps

### Build Tools

- **Vite** - Frontend build tool and dev server
- **pnpm** - Package management and workspace orchestration
- **Cross-env** - Environment variable management

### Containerization

- **Docker** - Application containerization
- **Docker Compose** - Multi-service development environment
- **AWS ECR** - Container registry for production

### Cloud Infrastructure

- **AWS** - Cloud infrastructure and services
- **EC2** - Virtual server instances
- **RDS** - Managed database service
- **S3** - Object storage for assets

### Version Control

- **Git** - Distributed version control
- **GitHub** - Repository hosting and collaboration
- **GitHub Actions** - CI/CD pipeline automation

## 📧 External Services

### Email Services

- **ConvertKit** - Email marketing platform
- **Nodemailer** - SMTP email sending
- **Template System** - Customizable email templates

### Payment Processing

- **PayPal** - Payment gateway integration
- **Webhook System** - Real-time payment notifications
- **Sandbox Testing** - Development payment testing

### Community Platforms

- **Discord** - Community server and communication
- **Ko-Fi** - Community funding platform
- **Newsletter** - Email marketing and updates

## 🔒 Security & Performance

### Security Features

- **bcryptjs** - Secure password hashing
- **Secure Sessions** - Encrypted session storage
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request data sanitization

### Performance Optimizations

- **Connection Pooling** - Database connection optimization
- **Image Caching** - Asset loading optimization
- **Tile Map System** - Spatial query optimization
- **State Synchronization** - Efficient game state updates

## 📊 Monitoring & Analytics

### Development Tools

- **ESLint** - Code quality monitoring
- **Console Logging** - Application debugging
- **Error Handling** - Comprehensive error management

### Production Monitoring

- **AWS CloudWatch** - Application monitoring
- **Database Monitoring** - Performance tracking
- **Error Tracking** - Production issue identification

## 🔄 Integration Points

### API Integration

- **RESTful APIs** - Standard HTTP endpoints
- **WebSocket APIs** - Real-time communication
- **Swagger Documentation** - API documentation

### Third-party Services

- **ConvertKit API** - Email marketing integration
- **PayPal API** - Payment processing
- **Discord API** - Community integration

---

_This technology stack provides a robust foundation for a modern multiplayer game with real-time features, cross-platform support, and scalable architecture._
