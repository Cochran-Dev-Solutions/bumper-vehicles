# API Reference

## Overview

This document provides a comprehensive reference for all API endpoints in the Bumper Vehicles project. The API is built with Fastify and follows RESTful conventions with comprehensive error handling and validation.

## Base Information

- **Base URL**: `https://api.bumpervehicles.com`
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **Rate Limiting**: Varies by endpoint (see individual endpoints)

## Authentication

### JWT Token Format

```javascript
// Token structure
{
  "userId": 123,
  "email": "user@example.com",
  "username": "player1",
  "isBetaUser": true,
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Authentication Header

```http
Authorization: Bearer <jwt_token>
```

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

## Authentication Endpoints

### POST /api/auth/register

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

**Error Responses:**

- `400` - Validation error (invalid email, weak password, etc.)
- `409` - Email already exists
- `500` - Server error

### POST /api/auth/login

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

**Error Responses:**

- `400` - Invalid credentials
- `401` - Account not verified
- `500` - Server error

### POST /api/auth/verify-email

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

**Error Responses:**

- `400` - Invalid or expired token
- `500` - Server error

### POST /api/auth/forgot-password

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

**Error Responses:**

- `400` - Email not found
- `500` - Server error

### POST /api/auth/reset-password

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

**Error Responses:**

- `400` - Invalid or expired token
- `400` - Weak password
- `500` - Server error

## User Management Endpoints

### GET /api/users/profile

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

**Error Responses:**

- `401` - Invalid or missing token
- `404` - User not found
- `500` - Server error

### PUT /api/users/profile

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

**Error Responses:**

- `400` - Validation error
- `401` - Invalid or missing token
- `409` - Username already taken
- `500` - Server error

### DELETE /api/users/account

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

**Error Responses:**

- `400` - Invalid password
- `401` - Invalid or missing token
- `500` - Server error

## Game Session Endpoints

### POST /api/games/create

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

**Error Responses:**

- `400` - Validation error
- `401` - Invalid or missing token
- `500` - Server error

### GET /api/games/active

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

**Error Responses:**

- `401` - Invalid or missing token
- `500` - Server error

### POST /api/games/{sessionId}/join

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

**Error Responses:**

- `400` - Validation error
- `401` - Invalid or missing token
- `404` - Session not found
- `409` - Session full or already joined
- `500` - Server error

### DELETE /api/games/{sessionId}/leave

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

**Error Responses:**

- `401` - Invalid or missing token
- `404` - Session not found
- `500` - Server error

### GET /api/games/{sessionId}/state

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

**Error Responses:**

- `401` - Invalid or missing token
- `404` - Session not found
- `500` - Server error

## Beta Testing Endpoints

### POST /api/beta/request

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

**Error Responses:**

- `400` - Validation error
- `409` - Email already requested
- `500` - Server error

### POST /api/beta/verify

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

**Error Responses:**

- `400` - Invalid credentials
- `404` - Beta user not found
- `500` - Server error

## Newsletter Endpoints

### POST /api/newsletter/subscribe

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

**Error Responses:**

- `400` - Validation error
- `409` - Already subscribed
- `500` - Server error

### POST /api/newsletter/unsubscribe

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

**Error Responses:**

- `400` - Validation error
- `404` - Email not found
- `500` - Server error

## Payment Endpoints

### POST /api/payments/create-order

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

**Error Responses:**

- `400` - Validation error
- `401` - Invalid or missing token
- `500` - Server error

### POST /api/payments/webhook

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

**Error Responses:**

- `400` - Invalid webhook data
- `500` - Server error

## WebSocket Events

### Client → Server Events

#### join-game

Join a game session.

```javascript
socket.emit("join-game", {
  sessionId: "game_abc123",
  playerName: "player1",
  characterId: "penguin",
});
```

#### player-input

Send player input to server.

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

#### leave-game

Leave a game session.

```javascript
socket.emit("leave-game", {
  sessionId: "game_abc123",
});
```

### Server → Client Events

#### game-state-update

Receive game state updates.

```javascript
socket.on("game-state-update", data => {
  console.log("Game state updated:", data);
  // Update game renderer with new state
});
```

#### player-joined

Player joined the game.

```javascript
socket.on("player-joined", data => {
  console.log("Player joined:", data.player);
  // Add new player to game
});
```

#### player-left

Player left the game.

```javascript
socket.on("player-left", data => {
  console.log("Player left:", data.playerId);
  // Remove player from game
});
```

#### game-started

Game has started.

```javascript
socket.on("game-started", data => {
  console.log("Game started:", data);
  // Initialize game renderer
});
```

#### game-ended

Game has ended.

```javascript
socket.on("game-ended", data => {
  console.log("Game ended:", data);
  // Show results screen
});
```

## Error Codes

| Code                   | Description                               | HTTP Status |
| ---------------------- | ----------------------------------------- | ----------- |
| `VALIDATION_ERROR`     | Request validation failed                 | 400         |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication         | 401         |
| `AUTHORIZATION_ERROR`  | Insufficient permissions                  | 403         |
| `NOT_FOUND`            | Resource not found                        | 404         |
| `CONFLICT`             | Resource conflict (e.g., duplicate email) | 409         |
| `RATE_LIMIT_EXCEEDED`  | Too many requests                         | 429         |
| `INTERNAL_ERROR`       | Server error                              | 500         |

## Rate Limiting

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

## SDK Examples

### JavaScript/TypeScript

```javascript
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

// Get user profile
const profile = await api.users.getProfile();
```

### Python

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

### cURL Examples

```bash
# Register user
curl -X POST https://api.bumpervehicles.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "player1"
  }'

# Login
curl -X POST https://api.bumpervehicles.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Create game session
curl -X POST https://api.bumpervehicles.com/api/games/create \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "gameType": "multiplayer",
    "mapId": "island_arena",
    "maxPlayers": 4
  }'
```

## Testing

### Postman Collection

Import the Postman collection for testing:

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

This comprehensive API reference provides all the information needed to integrate with the Bumper Vehicles backend, including authentication, game management, and real-time communication.
