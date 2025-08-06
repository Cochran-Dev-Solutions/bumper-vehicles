# System Architecture 🏗️

This document provides a detailed overview of the Bumper Vehicles system architecture, including the monorepo structure, application descriptions, and package organization.

## 📁 Monorepo Structure

The project uses a modern monorepo architecture with pnpm workspaces, organized into `apps/` and `packages/` directories:

```
bumper-vehicles/
├── apps/                   # Application layer
│   ├── server/             # Backend API server
│   ├── landing-page/       # Marketing website
│   ├── web-client/         # Desktop game client
│   └── mobile-client/      # Mobile game client
├── packages/               # Shared packages
│   ├── client-logic/       # Cross-platform game logic
│   ├── database/           # Database abstraction layer
│   ├── mailer/             # Email service package
│   ├── payment/            # Payment processing package
│   └── redis/              # Redis utilities (future)
├── Media/                  # Centralized asset storage
├── scripts/                # Build and utility scripts
└── docs/                   # Documentation
```

## 🖥️ Applications (apps/)

### 1. Server (`apps/server/`)

**Purpose**: Backend API server providing game logic, session management, and WebSocket communication.

**Key Components**:

- **Fastify Framework** - High-performance web server
- **WebSocket Manager** - Real-time game communication
- **Game Engine** - Physics and game logic processing
- **Database Integration** - User management and data persistence
- **Email Services** - User verification and notifications
- **Payment Processing** - PayPal integration and webhooks

**Architecture Layers**:

```
apps/server/
├── server.js              # Main application entry point
├── routes/                # API route definitions
│   ├── auth_routes.js     # Authentication endpoints
│   ├── user_routes.js     # User management
│   ├── newsletter_routes.js # Email marketing
│   └── payment_routes.js  # Payment processing
├── controllers/           # Business logic layer
│   ├── auth_controllers.js # Authentication logic
│   └── user_controllers.js # User management logic
├── src/                   # Core application logic
│   ├── game/             # Game engine components
│   │   ├── Game.js       # Main game class
│   │   ├── Map.js        # Map management
│   │   └── websocket-manager.js # WebSocket handling
│   ├── game_entities/    # Game object definitions
│   │   ├── PlayerEntity.js # Player game objects
│   │   ├── BlockEntity.js  # Static game objects
│   │   └── PowerupEntity.js # Interactive objects
│   ├── physics/          # Physics engine
│   │   ├── PhysicsWorld.js # Main physics system
│   │   ├── BoundingBox.js  # Collision detection
│   │   └── TileMap.js      # Spatial optimization
│   ├── services/         # External service integrations
│   │   └── convertkit.js   # Email marketing service
│   ├── email_templates/  # Email template system
│   └── utils/            # Utility functions
└── package.json          # Dependencies and scripts
```

**Technology Stack**:

- **Fastify** - Web framework with high performance
- **Socket.IO** - Real-time bidirectional communication
- **MySQL** - Relational database with connection pooling
- **bcryptjs** - Secure password hashing
- **Swagger** - API documentation and testing

### 2. Landing Page (`apps/landing-page/`)

**Purpose**: Marketing website with user registration, beta testing signup, and community features.

**Key Components**:

- **React Router** - Client-side navigation
- **Tailwind CSS** - Utility-first styling
- **Newsletter Integration** - ConvertKit email marketing
- **Payment Integration** - PayPal and Ko-Fi support
- **Responsive Design** - Mobile-first approach

**Architecture**:

```
apps/landing-page/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.jsx     # Page layout wrapper
│   │   ├── Navigation.jsx # Navigation component
│   │   ├── Footer.jsx     # Footer component
│   │   ├── KoFiButton.jsx # Support button component
│   │   └── NewsletterForm.jsx # Email signup form
│   ├── pages/            # Page components
│   │   ├── WelcomePage.jsx # Landing page
│   │   ├── BetaTestingPage.jsx # Beta signup
│   │   ├── CommunityPage.jsx # Community info
│   │   └── SupportPage.jsx # Support information
│   ├── hooks/            # Custom React hooks
│   │   └── useScrollToElement.js # Scroll utilities
│   ├── utils/            # Utility functions
│   │   └── config.js     # Configuration constants
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

**Technology Stack**:

- **React 18** - Component-based UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast development server and build tool

### 3. Web Client (`apps/web-client/`)

**Purpose**: Desktop game client using p5.js for canvas rendering and real-time multiplayer gameplay.

**Key Components**:

- **p5.js Integration** - Canvas-based rendering
- **Shared Client Logic** - Cross-platform game logic
- **Scene Management** - Game state and UI management
- **Asset Loading** - Image and resource management
- **WebSocket Client** - Real-time server communication

**Architecture**:

```
apps/web-client/
├── src/
│   ├── main.js           # Application entry point
│   ├── index.css         # Global styles
│   ├── Scenes/           # Game scene components
│   │   ├── gameScene.js  # Main game scene
│   │   ├── menuScene.js  # Menu interface
│   │   ├── garageScene.js # Vehicle customization
│   │   ├── mapScene.js   # Map selection
│   │   └── loginScene.js # Authentication
│   └── render-tools/     # p5.js rendering utilities
│       ├── images.js     # Image loading and caching
│       └── htmlForms.js  # HTML form integration
├── public/               # Static assets
│   └── Images/          # Game images and sprites
└── package.json          # Dependencies and scripts
```

**Technology Stack**:

- **p5.js** - Creative coding library for canvas rendering
- **Vite** - Development server and build tool
- **Shared Client Logic** - Cross-platform game logic package

### 4. Mobile Client (`apps/mobile-client/`)

**Purpose**: Mobile game client using React Native and Skia for high-performance graphics.

**Key Components**:

- **React Native** - Cross-platform mobile development
- **Skia Graphics** - High-performance 2D rendering
- **Shared Client Logic** - Cross-platform game logic
- **Expo Platform** - Development and deployment tools

**Architecture**:

```
apps/mobile-client/
├── App.jsx               # Main application component
├── assets/               # Mobile-specific assets
│   ├── fonts/           # Custom fonts
│   └── images/          # Mobile-optimized images
├── android/             # Android-specific configuration
├── ios/                 # iOS-specific configuration
└── package.json         # Dependencies and scripts
```

**Technology Stack**:

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tools
- **@shopify/react-native-skia** - High-performance graphics
- **React Native Reanimated** - Smooth animations

## 📦 Shared Packages (packages/)

### 1. Client Logic (`packages/client-logic/`)

**Purpose**: Cross-platform game logic shared between web and mobile clients.

**Key Components**:

- **Actor System** - Game object representation
- **Event Management** - Input handling and scene management
- **Rendering Abstraction** - Platform-agnostic rendering
- **Networking** - WebSocket communication layer

**Architecture**:

```
packages/client-logic/src/
├── core/                 # Core game systems
│   ├── actors/          # Game object actors
│   │   ├── dynamic-actors/ # Moving game objects
│   │   │   ├── PlayerActor.js # Player representation
│   │   │   ├── BouncyBallActor.js # Physics objects
│   │   │   └── PowerupActor.js # Power-up objects
│   │   └── static-actors/ # Static game objects
│   │       ├── BlockActor.js # Obstacle objects
│   │       ├── CheckpointActor.js # Checkpoint objects
│   │       └── FinishPortalActor.js # Goal objects
│   ├── camera/          # Camera system
│   │   ├── Camera.js    # Base camera class
│   │   ├── GameCamera.js # Game-specific camera
│   │   └── MapCamera.js  # Map view camera
│   ├── event-management/ # Input and event handling
│   │   ├── SceneManager.js # Scene state management
│   │   ├── KeyManager.js # Keyboard input handling
│   │   ├── InputManager.js # Input abstraction
│   │   └── Button.js     # UI button system
│   └── rendering/       # Rendering system
│       ├── GameRenderer.js # Main rendering class
│       └── AnimatedSprite.js # Animated graphics
├── networking/          # Network communication
│   ├── socket.js        # WebSocket client
│   └── ajax.js          # HTTP requests
├── scene-tools/         # Scene-specific utilities
│   ├── garage/          # Garage scene tools
│   │   └── GarageCharacter.js # Character customization
│   └── map/             # Map scene tools
│       ├── MapCharacter.js # Map character
│       ├── Island.js     # Island objects
│       └── Camera.js     # Map camera
├── utils/               # Utility functions
│   └── collisions.js    # Collision detection
├── globals.js           # Global variables and functions
└── index.js             # Package entry point
```

### 2. Database (`packages/database/`)

**Purpose**: Database abstraction layer with Data Access Layer (DAL) pattern.

**Key Components**:

- **Connection Management** - Database connection pooling
- **Data Access Layer** - Database operation abstraction
- **Models** - Data structure definitions
- **Migration Scripts** - Database schema management

**Architecture**:

```
packages/database/
├── index.js             # Main database connection
├── dal/                 # Data Access Layer
│   ├── user.dal.js      # User data operations
│   ├── unverified-user.dal.js # Pending user operations
│   └── beta-user.dal.js # Beta user operations
├── models/              # Data models
│   ├── user.model.js    # User data structure
│   └── unverified-user.model.js # Pending user structure
└── scripts/             # Database scripts
    └── main.sql         # Database schema
```

### 3. Mailer (`packages/mailer/`)

**Purpose**: Email service package for user verification and marketing.

**Key Components**:

- **Nodemailer Integration** - SMTP email sending
- **Template System** - HTML email templates
- **Verification System** - Email verification codes
- **Marketing Integration** - ConvertKit integration

**Architecture**:

```
packages/mailer/
├── index.js             # Package entry point
├── nodemailer.js        # Nodemailer service class
├── utils.js             # Email utilities
└── package.json         # Dependencies
```

### 4. Payment (`packages/payment/`)

**Purpose**: Payment processing package for PayPal integration.

**Key Components**:

- **PayPal Integration** - Payment gateway
- **Webhook Handling** - Payment notifications
- **Order Management** - Payment state tracking

**Architecture**:

```
packages/payment/
├── index.js             # Package entry point
├── paypal.js            # PayPal service class
└── package.json         # Dependencies
```

### 5. Redis (`packages/redis/`)

**Purpose**: Redis utilities for caching and real-time features (future implementation).

**Key Components**:

- **Caching Layer** - Session and data caching
- **Pub/Sub Messaging** - Real-time communication
- **Performance Optimization** - High-speed data storage

**Architecture**:

```
packages/redis/
├── index.js             # Main Redis connection
├── client/              # Redis client utilities
├── bloom/               # Bloom filter utilities
├── graph/               # Graph data structures
├── json/                # JSON data handling
├── search/              # Search functionality
├── time-series/         # Time series data
└── package.json         # Dependencies
```

## 🔄 Package Dependencies

### Workspace Dependencies

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Cross-Package Dependencies

- **Server** depends on: `@bumper-vehicles/database`, `@bumper-vehicles/mailer`, `@bumper-vehicles/payment`
- **Web Client** depends on: `client-logic`
- **Mobile Client** depends on: `client-logic` (future)
- **Landing Page** depends on: `@bumper-vehicles/mailer` (for email features)

## 🏗️ Architecture Principles

### 1. Separation of Concerns

- **Backend Logic** - Game physics and state management
- **Frontend Rendering** - Visual representation and user interaction
- **Shared Logic** - Cross-platform game logic
- **Data Layer** - Database abstraction and data access

### 2. Modularity

- **Package-based Architecture** - Reusable components across applications
- **Plugin System** - Extensible functionality through packages
- **Clear Interfaces** - Well-defined boundaries between components

### 3. Scalability

- **Monorepo Management** - Efficient dependency management
- **Microservices Ready** - Package-based architecture enables service extraction
- **Cloud-Native** - Containerized deployment with Docker

### 4. Cross-Platform Support

- **Shared Logic** - Common game logic across platforms
- **Platform-Specific Rendering** - Optimized rendering for each platform
- **Unified API** - Consistent interfaces across applications

## 🔧 Development Workflow

### Package Development

1. **Local Development** - Use pnpm workspaces for local development
2. **Cross-Package Testing** - Test package integration locally
3. **Version Management** - Coordinate package versions across applications

### Application Development

1. **Feature Development** - Develop features in appropriate applications
2. **Shared Logic** - Extract common logic to packages
3. **Integration Testing** - Test cross-application integration

### Deployment Strategy

1. **Package Publishing** - Publish packages to npm registry
2. **Application Deployment** - Deploy applications independently
3. **Version Coordination** - Manage package versions across applications

---

_This architecture provides a scalable, maintainable foundation for a modern multiplayer game with cross-platform support and real-time features._
