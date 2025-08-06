# API Documentation

## Overview

The Bumper Vehicles backend API is built with Fastify and provides RESTful endpoints for user management, game sessions, authentication, and real-time communication via WebSockets. The API follows REST conventions and includes comprehensive Swagger documentation.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.bumpervehicles.com`

## Authentication

### JWT Token Authentication

Most endpoints require authentication via JWT tokens:

```http
Authorization: Bearer <jwt_token>
```

### Token Format

```javascript
// JWT payload structure
{
  "userId": 123,
  "email": "user@example.com",
  "username": "player1",
  "isBetaUser": true,
  "iat": 1640995200,
  "exp": 1641081600
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "player1",
  "newsletterSubscription": true
}
```

**Response (201):**

```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "player1",
    "isVerified": false,
    "isBetaUser": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Registration successful. Please check your email for verification."
}
```

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "player1",
    "isVerified": true,
    "isBetaUser": false
  }
}
```

#### POST /api/auth/verify-email

Verify email address with token.

**Request Body:**

```json
{
  "token": "verification_token_here"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /api/auth/reset-password

Reset password with token.

**Request Body:**

```json
{
  "token": "reset_token_here",
  "newPassword": "newsecurepassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Management Endpoints

#### GET /api/users/profile

Get current user profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "player1",
    "isVerified": true,
    "isBetaUser": false,
    "profileData": {
      "preferredCharacter": "penguin",
      "totalGames": 45,
      "wins": 23,
      "achievements": ["first_win", "speed_demon"]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/users/profile

Update user profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "username": "newusername",
  "profileData": {
    "preferredCharacter": "alligator",
    "soundEnabled": true,
    "musicVolume": 0.8
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 123,
    "username": "newusername",
    "profileData": {
      "preferredCharacter": "alligator",
      "soundEnabled": true,
      "musicVolume": 0.8
    }
  }
}
```

#### DELETE /api/users/account

Delete user account.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "password": "currentpassword"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Game Session Endpoints

#### POST /api/games/create

Create a new game session.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "gameType": "multiplayer",
  "mapId": "island_arena",
  "maxPlayers": 4,
  "gameSettings": {
    "timeLimit": 300,
    "powerupsEnabled": true,
    "collisionDamage": 10
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "session": {
    "sessionId": "game_abc123",
    "hostUserId": 123,
    "gameType": "multiplayer",
    "mapId": "island_arena",
    "maxPlayers": 4,
    "currentPlayers": 1,
    "status": "waiting",
    "gameSettings": {
      "timeLimit": 300,
      "powerupsEnabled": true,
      "collisionDamage": 10
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/games/active

Get list of active game sessions.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `gameType` (optional): Filter by game type
- `mapId` (optional): Filter by map
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**

```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "game_abc123",
      "hostUsername": "player1",
      "gameType": "multiplayer",
      "mapId": "island_arena",
      "maxPlayers": 4,
      "currentPlayers": 2,
      "status": "waiting",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### POST /api/games/{sessionId}/join

Join an existing game session.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "playerName": "player2",
  "characterId": "penguin"
}
```

**Response (200):**

```json
{
  "success": true,
  "session": {
    "sessionId": "game_abc123",
    "players": [
      {
        "userId": 123,
        "playerName": "player1",
        "characterId": "alligator",
        "isHost": true
      },
      {
        "userId": 124,
        "playerName": "player2",
        "characterId": "penguin",
        "isHost": false
      }
    ],
    "gameSettings": {
      "timeLimit": 300,
      "powerupsEnabled": true
    }
  }
}
```

#### DELETE /api/games/{sessionId}/leave

Leave a game session.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Left game session successfully"
}
```

#### GET /api/games/{sessionId}/state

Get current game state.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "gameState": {
    "sessionId": "game_abc123",
    "status": "active",
    "timeRemaining": 245,
    "players": [
      {
        "id": "player_1",
        "position": { "x": 100, "y": 200 },
        "velocity": { "x": 5, "y": 0 },
        "health": 100,
        "score": 150,
        "characterId": "alligator",
        "powerups": ["speed_boost"]
      }
    ],
    "entities": [
      {
        "id": "entity_1",
        "type": "powerup",
        "position": { "x": 300, "y": 400 },
        "powerupType": "health_boost"
      }
    ],
    "mapData": {
      "bounds": { "width": 800, "height": 600 },
      "obstacles": [{ "x": 0, "y": 0, "width": 50, "height": 600 }]
    }
  }
}
```

### Beta Testing Endpoints

#### POST /api/beta/request

Request beta access.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "betaplayer",
  "newsletterSubscription": true,
  "source": "website"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Beta access request submitted. You will receive credentials via email."
}
```

#### POST /api/beta/verify

Verify beta credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "betaCode": "BETA123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "credentials": {
    "username": "betaplayer",
    "password": "temp_password_123",
    "loginUrl": "https://app.bumpervehicles.com"
  }
}
```

### Newsletter Endpoints

#### POST /api/newsletter/subscribe

Subscribe to newsletter.

**Request Body:**

```json
{
  "email": "user@example.com",
  "tags": ["beta_tester", "game_updates"],
  "source": "website"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

#### POST /api/newsletter/unsubscribe

Unsubscribe from newsletter.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

### Payment Endpoints

#### POST /api/payments/create-order

Create PayPal order for beta access.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "productId": "beta_access",
  "quantity": 1
}
```

**Response (200):**

```json
{
  "success": true,
  "orderId": "PAY-123456789",
  "approvalUrl": "https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-123456789"
}
```

#### POST /api/payments/webhook

PayPal webhook for payment notifications.

**Request Body:**

```json
{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "CAPTURE-123456789",
    "status": "COMPLETED",
    "amount": {
      "currency_code": "USD",
      "value": "9.99"
    },
    "custom_id": "beta_access_user_123"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoint:

```javascript
const socket = io("https://api.bumpervehicles.com", {
  auth: {
    token: "jwt_token_here",
  },
});
```

### Event Handlers

#### Client → Server Events

**join-game**

```javascript
socket.emit("join-game", {
  sessionId: "game_abc123",
  playerName: "player1",
  characterId: "penguin",
});
```

**player-input**

```javascript
socket.emit("player-input", {
  sessionId: "game_abc123",
  input: {
    up: true,
    down: false,
    left: false,
    right: true,
    action: "boost",
  },
});
```

**leave-game**

```javascript
socket.emit("leave-game", {
  sessionId: "game_abc123",
});
```

#### Server → Client Events

**game-state-update**

```javascript
socket.on("game-state-update", data => {
  console.log("Game state updated:", data);
  // Update game renderer with new state
});
```

**player-joined**

```javascript
socket.on("player-joined", data => {
  console.log("Player joined:", data.player);
  // Add new player to game
});
```

**player-left**

```javascript
socket.on("player-left", data => {
  console.log("Player left:", data.playerId);
  // Remove player from game
});
```

**game-started**

```javascript
socket.on("game-started", data => {
  console.log("Game started:", data);
  // Initialize game renderer
});
```

**game-ended**

```javascript
socket.on("game-ended", data => {
  console.log("Game ended:", data);
  // Show results screen
});
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Common Error Codes

| Code                   | Description                               | HTTP Status |
| ---------------------- | ----------------------------------------- | ----------- |
| `VALIDATION_ERROR`     | Request validation failed                 | 400         |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication         | 401         |
| `AUTHORIZATION_ERROR`  | Insufficient permissions                  | 403         |
| `NOT_FOUND`            | Resource not found                        | 404         |
| `CONFLICT`             | Resource conflict (e.g., duplicate email) | 409         |
| `RATE_LIMIT_EXCEEDED`  | Too many requests                         | 429         |
| `INTERNAL_ERROR`       | Server error                              | 500         |

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Game endpoints**: 100 requests per minute
- **User endpoints**: 50 requests per minute
- **Newsletter endpoints**: 10 requests per minute

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Swagger Documentation

The API includes comprehensive Swagger/OpenAPI documentation available at:

- **Development**: `http://localhost:3000/docs`
- **Production**: `https://api.bumpervehicles.com/docs`

### Swagger Configuration

```javascript
// apps/server/server.js
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");

// Register Swagger
await fastify.register(swagger, {
  swagger: {
    info: {
      title: "Bumper Vehicles API",
      description: "API documentation for Bumper Vehicles game",
      version: "1.0.0",
    },
    host: "api.bumpervehicles.com",
    schemes: ["https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: true,
  },
});
```

## SDK Libraries

### JavaScript/TypeScript SDK

```javascript
// Example usage
import { BumperVehiclesAPI } from "@bumper-vehicles/sdk";

const api = new BumperVehiclesAPI({
  baseUrl: "https://api.bumpervehicles.com",
  token: "jwt_token_here",
});

// Create game session
const session = await api.games.create({
  gameType: "multiplayer",
  mapId: "island_arena",
  maxPlayers: 4,
});

// Join game
await api.games.join(session.sessionId, {
  playerName: "player1",
  characterId: "penguin",
});
```

### Python SDK

```python
from bumper_vehicles import BumperVehiclesAPI

api = BumperVehiclesAPI(
    base_url="https://api.bumpervehicles.com",
    token="jwt_token_here"
)

# Create game session
session = api.games.create(
    game_type="multiplayer",
    map_id="island_arena",
    max_players=4
)

# Join game
api.games.join(
    session_id=session.session_id,
    player_name="player1",
    character_id="penguin"
)
```

## Testing

### API Testing with Postman

Import the Postman collection:

```json
{
  "info": {
    "name": "Bumper Vehicles API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"username\": \"testuser\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

### Automated Testing

```javascript
// tests/api/auth.test.js
describe("Authentication API", () => {
  test("should register new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe("test@example.com");
  });
});
```

This comprehensive API documentation provides all the information needed to integrate with the Bumper Vehicles backend, including authentication, game management, real-time communication, and proper error handling.
