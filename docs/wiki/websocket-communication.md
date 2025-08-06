# WebSocket Communication 🔄

This document provides a comprehensive overview of the WebSocket communication system in Bumper Vehicles, including connection management, real-time game state synchronization, and sequence diagrams for key game events.

## 🏗️ Architecture Overview

The WebSocket system provides **real-time bidirectional communication** between the game server and clients, enabling:

- **Instant Game Updates** - Real-time state synchronization
- **Player Input** - Immediate response to player actions
- **Connection Management** - Robust handling of connections/disconnections
- **Room Management** - Game session isolation

## 🔌 Connection Management

### WebSocket Manager (`apps/server/src/game/websocket-manager.js`)

The WebSocket manager handles all real-time communication:

```javascript
class WebSocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
      },
    });
    this.games = new Map();
  }

  initialize() {
    this.setupEventHandlers();
    this.startGameLoop();
  }
}
```

### Connection Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Game
    participant Database

    Client->>Server: WebSocket Connection Request
    Server->>Server: Validate Origin
    Server->>Client: Connection Established
    Client->>Server: Authentication Request
    Server->>Database: Verify User Credentials
    Database->>Server: User Data
    Server->>Client: Authentication Response
    Client->>Server: Join Game Request
    Server->>Game: Create/Join Game Session
    Game->>Server: Game State
    Server->>Client: Game State & Player Data
```

## 🎮 Game Session Management

### Game Creation Process

```mermaid
sequenceDiagram
    participant Player1
    participant Player2
    participant Server
    participant Game

    Player1->>Server: Create Game (Race Mode)
    Server->>Game: Initialize Game Session
    Game->>Game: Load Map & Setup Physics
    Server->>Player1: Game Created (Waiting for Players)

    Player2->>Server: Join Game Request
    Server->>Game: Add Player to Game
    Game->>Game: Assign Spawn Point
    Game->>Server: Player Added Successfully
    Server->>Player2: Joined Game Confirmation
    Server->>Player1: Player Joined Notification

    Note over Game: Check if enough players
    Game->>Server: Ready to Start
    Server->>Player1: Game Starting
    Server->>Player2: Game Starting
```

### Player Joining Sequence

```javascript
// Client requests to join game
socket.emit("joinGame", {
  gameId: "game_123",
  playerData: {
    id: "player_456",
    username: "Player1",
    character: "penguin",
  },
});

// Server processes join request
socket.on("joinGame", async data => {
  const game = games.get(data.gameId);
  if (game && game.state === "waiting") {
    const player = await game.addPlayer(socket, data.playerData, data.playerId);

    // Notify all players in game
    io.to(data.gameId).emit("playerJoined", {
      playerId: player.id,
      playerData: player.data,
    });

    // Send initial game state to new player
    socket.emit("gameState", game.getInitialState());
  }
});
```

## 🔄 Real-time State Synchronization

### State Update Flow

```mermaid
sequenceDiagram
    participant Game
    participant Server
    participant Player1
    participant Player2

    Note over Game: Game Loop Running
    Game->>Game: Update Physics & Game Logic
    Game->>Game: Check for State Changes
    Game->>Server: Changed State Data
    Server->>Player1: State Update (Delta)
    Server->>Player2: State Update (Delta)

    Player1->>Server: Player Input (Movement)
    Server->>Game: Process Player Input
    Game->>Game: Update Player Entity
    Game->>Server: Updated Player State
    Server->>Player1: Input Confirmation
    Server->>Player2: Player Movement Update
```

### State Synchronization Code

```javascript
// Server game loop
setInterval(() => {
  games.forEach(game => {
    // Update game physics
    game.update(io);

    // Send state changes to all players
    const changedState = game.getChangedActorsState();
    const newActors = game.getNewActorsState();
    const removedActors = game.getRemovedActorsIds();

    if (
      changedState.length > 0 ||
      newActors.length > 0 ||
      removedActors.length > 0
    ) {
      io.to(game.id).emit("stateChanges", {
        changed: changedState,
        new: newActors,
        removed: removedActors,
      });
    }
  });
}, 1000 / 60); // 60 FPS
```

### Client State Processing

```javascript
// Client receives state updates
socket.on("stateChanges", data => {
  // Process changed actors
  data.changed.forEach(actorState => {
    const actor = gameRenderer.getActor(actorState.id);
    if (actor) {
      actor.update(actorState);
    }
  });

  // Process new actors
  data.new.forEach(actorState => {
    gameRenderer.createActor(actorState);
  });

  // Process removed actors
  data.removed.forEach(actorId => {
    gameRenderer.removeActor(actorId);
  });
});
```

## 🎯 Player Input Handling

### Input Flow

```mermaid
sequenceDiagram
    participant Player
    participant Client
    participant Server
    participant Game

    Player->>Client: Key Press (WASD)
    Client->>Client: Process Input Locally
    Client->>Server: Send Input Event
    Server->>Game: Process Player Input
    Game->>Game: Update Player Entity
    Game->>Server: Confirm Input Processing
    Server->>Client: Input Confirmation
    Server->>Game: Broadcast to Other Players
    Game->>Server: Updated Player State
    Server->>Client: Player Movement Update
```

### Input Processing Code

```javascript
// Client sends input
keyManager.onKeyPress("KeyW", () => {
  socket.emit("playerInput", {
    type: "movement",
    direction: "up",
    timestamp: Date.now(),
  });
});

// Server processes input
socket.on("playerInput", input => {
  const game = getPlayerGame(socket.id);
  const player = game.getPlayerBySocketId(socket.id);

  if (player && game.state === "playing") {
    // Process input and update player
    player.processInput(input);

    // Confirm input processing
    socket.emit("inputProcessed", {
      inputId: input.id,
      timestamp: input.timestamp,
    });

    // Broadcast to other players
    socket.to(game.id).emit("playerInput", {
      playerId: player.id,
      input: input,
    });
  }
});
```

## 🔌 Connection Lifecycle

### Player Disconnection

```mermaid
sequenceDiagram
    participant Player
    participant Server
    participant Game
    participant OtherPlayers

    Player->>Server: Connection Lost
    Server->>Game: Handle Player Disconnect
    Game->>Game: Mark Player as Disconnected
    Game->>Game: Start Reconnection Timer
    Server->>OtherPlayers: Player Disconnected Notification

    Note over Game: Wait for Reconnection (6 seconds)
    alt Player Reconnects
        Player->>Server: Reconnection Request
        Server->>Game: Restore Player Session
        Game->>Server: Player Restored
        Server->>Player: Reconnection Successful
        Server->>OtherPlayers: Player Reconnected
    else Timeout
        Game->>Game: Remove Player Permanently
        Server->>OtherPlayers: Player Removed
    end
```

### Reconnection Handling

```javascript
// Server handles disconnection
socket.on("disconnect", () => {
  const game = getPlayerGame(socket.id);
  if (game) {
    const player = game.getPlayerBySocketId(socket.id);
    if (player) {
      // Mark player as disconnected
      game.handleDisconnect(socket.id, io);

      // Start reconnection timer
      setTimeout(() => {
        if (!player.isReconnected) {
          game.removePlayer(socket.id);
          io.to(game.id).emit("playerRemoved", {
            playerId: player.id,
          });
        }
      }, 6000); // 6 second timeout
    }
  }
});

// Player reconnection
socket.on("reconnect", data => {
  const game = games.get(data.gameId);
  const player = game.getPlayerByPlayerId(data.playerId);

  if (player && !player.isReconnected) {
    game.handleReconnect(socket.id, data.playerId);
    socket.emit("reconnectionSuccessful", {
      gameState: game.getState(),
    });
  }
});
```

## 🎮 Game Events

### Game Start Event

```mermaid
sequenceDiagram
    participant Server
    participant Game
    participant Player1
    participant Player2

    Note over Game: Enough Players Joined
    Game->>Game: Start Game Logic
    Game->>Server: Game State Changed
    Server->>Player1: Game Started Event
    Server->>Player2: Game Started Event

    Note over Game: Begin Game Loop
    loop Game Running
        Game->>Game: Update Physics
        Game->>Server: State Changes
        Server->>Player1: State Update
        Server->>Player2: State Update
    end
```

### Game End Event

```mermaid
sequenceDiagram
    participant Game
    participant Server
    participant Player1
    participant Player2

    Note over Game: Victory Condition Met
    Game->>Game: End Game Logic
    Game->>Game: Calculate Results
    Game->>Server: Game Ended
    Server->>Player1: Game Results
    Server->>Player2: Game Results

    Server->>Server: Cleanup Game Session
    Server->>Player1: Return to Lobby
    Server->>Player2: Return to Lobby
```

## 📊 Performance Optimization

### Message Optimization

```javascript
// Optimize message size
const optimizeState = state => {
  return {
    // Only send essential data
    players: state.players.map(player => ({
      id: player.id,
      pos: player.position,
      vel: player.velocity,
      rot: player.rotation,
    })),
    entities: state.entities.map(entity => ({
      id: entity.id,
      type: entity.type,
      pos: entity.position,
      size: entity.size,
    })),
  };
};

// Compress messages
const compressMessage = message => {
  return JSON.stringify(message);
};
```

### Bandwidth Management

```javascript
// Throttle updates based on network conditions
class UpdateThrottler {
  constructor() {
    this.lastUpdate = 0;
    this.updateInterval = 16; // ~60 FPS
  }

  shouldUpdate() {
    const now = Date.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      this.lastUpdate = now;
      return true;
    }
    return false;
  }
}
```

## 🔒 Security & Validation

### Input Validation

```javascript
// Validate player input
const validateInput = input => {
  const validInputs = ["movement", "action", "powerup"];
  const validDirections = ["up", "down", "left", "right"];

  if (!validInputs.includes(input.type)) {
    return false;
  }

  if (input.type === "movement" && !validDirections.includes(input.direction)) {
    return false;
  }

  return true;
};
```

### Rate Limiting

```javascript
// Rate limit player inputs
const rateLimit = new Map();

const checkRateLimit = (playerId, inputType) => {
  const key = `${playerId}_${inputType}`;
  const now = Date.now();
  const lastInput = rateLimit.get(key) || 0;

  if (now - lastInput < 50) {
    // 50ms minimum between inputs
    return false;
  }

  rateLimit.set(key, now);
  return true;
};
```

## 🐛 Error Handling

### Connection Errors

```javascript
// Handle connection errors
socket.on("connect_error", error => {
  console.error("Connection error:", error);
  showReconnectingOverlay();
});

socket.on("reconnect", attemptNumber => {
  console.log("Reconnected after", attemptNumber, "attempts");
  hideReconnectingOverlay();
});

socket.on("reconnect_failed", () => {
  console.error("Failed to reconnect");
  showConnectionError();
});
```

### Game State Recovery

```javascript
// Recover from state inconsistencies
socket.on("stateError", error => {
  console.error("State error:", error);

  // Request full state update
  socket.emit("requestFullState");
});

socket.on("fullState", state => {
  // Reset client state and apply full state
  gameRenderer.resetState();
  gameRenderer.applyFullState(state);
});
```

## 📈 Monitoring & Analytics

### Connection Metrics

```javascript
// Track connection metrics
const connectionMetrics = {
  activeConnections: 0,
  totalGames: 0,
  averageLatency: 0,
  messageCount: 0,
};

// Update metrics
socket.on("connect", () => {
  connectionMetrics.activeConnections++;
});

socket.on("disconnect", () => {
  connectionMetrics.activeConnections--;
});
```

### Performance Monitoring

```javascript
// Monitor WebSocket performance
const performanceMetrics = {
  messageLatency: [],
  updateFrequency: 0,
  bandwidthUsage: 0,
};

// Track message latency
const trackLatency = messageId => {
  const startTime = Date.now();
  return response => {
    const latency = Date.now() - startTime;
    performanceMetrics.messageLatency.push(latency);
  };
};
```

---

_The WebSocket communication system provides robust real-time multiplayer functionality with efficient state synchronization, connection management, and error handling._
