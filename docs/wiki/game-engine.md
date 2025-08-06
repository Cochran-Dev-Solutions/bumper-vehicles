# Game Engine 🎮

This document provides a comprehensive overview of the Bumper Vehicles game engine, including the physics system, entity-actor architecture, and the relationship between frontend and backend components.

## 🏗️ Architecture Overview

The game engine follows a **client-server architecture** where:

- **Backend** handles physics, game logic, and state management
- **Frontend** handles rendering, user input, and visual representation
- **WebSocket** provides real-time communication between client and server

## 🎯 Core Components

### 1. Game Class (`apps/server/src/game/Game.js`)

The main game orchestrator that manages the entire game session.

**Key Responsibilities**:

- **Game State Management** - Controls game flow (waiting, playing, inactive)
- **Player Management** - Handles player connections, disconnections, and reconnections
- **Entity Coordination** - Manages all game entities and their interactions
- **State Synchronization** - Sends game state updates to clients
- **Map Management** - Loads and configures game maps

**Core Methods**:

```javascript
class Game {
  constructor(config) {
    this.physicsWorld = new PhysicsWorld();
    this.players = new Map();
    this.passive_actors = [];
    this.state = "waiting";
  }

  addPlayer(socket, userData, playerId) {
    /* Add new player */
  }
  removePlayer(socketId) {
    /* Remove disconnected player */
  }
  update(io) {
    /* Main game loop */
  }
  getState() {
    /* Get current game state */
  }
  start(io) {
    /* Start the game */
  }
}
```

### 2. Physics World (`apps/server/src/physics/PhysicsWorld.js`)

The physics engine that handles all game physics and collision detection.

**Key Features**:

- **Entity Management** - Tracks all physics entities
- **Collision Detection** - Handles entity interactions
- **Tile Map Integration** - Spatial optimization for large maps
- **State Tracking** - Monitors entity changes for synchronization

**Architecture**:

```javascript
export class PhysicsWorld {
  constructor() {
    this.entities = [];
    this.tileMap = new TileMap();
  }

  addEntity(entity) {
    /* Add entity to physics world */
  }
  removeEntity(entity) {
    /* Remove entity from physics world */
  }
  update() {
    /* Update all entities and check collisions */
  }
}
```

### 3. Entity System

The entity system uses a hierarchical structure with different types of game objects.

#### Entity Hierarchy

```
Entity (Base Class)
├── StaticEntity
│   ├── BlockEntity
│   ├── CheckpointEntity
│   ├── FinishPortalEntity
│   └── LazerEntity
├── PhysicsEntity
│   ├── PlayerEntity
│   ├── BouncyBallEntity
│   └── PowerupEntity
```

#### Entity Types

**Static Entities** (`apps/server/src/game_entities/static/`):

- **BlockEntity** - Immovable obstacles and walls
- **CheckpointEntity** - Race checkpoints and progress markers
- **FinishPortalEntity** - Race finish line and victory condition
- **LazerEntity** - Hazardous obstacles that damage players

**Physics Entities** (`apps/server/src/game_entities/physics/`):

- **PlayerEntity** - Controllable player vehicles
- **BouncyBallEntity** - Physics-based interactive objects
- **PowerupEntity** - Collectible power-ups and bonuses

#### Entity Base Class (`apps/server/src/game_entities/Entity.js`)

```javascript
export class Entity {
  constructor(config) {
    this.id = config.id;
    this.position = config.position;
    this.size = config.size;
    this.boundingBox = new BoundingBox(this);
    this.game = config.game;
    this.hasUpdate = true; // Whether entity needs physics updates
  }

  update() {
    /* Physics update logic */
  }
  onCollision(other) {
    /* Collision response */
  }
}
```

## 🎭 Actor System (Frontend)

The frontend uses an **Actor System** that mirrors the backend entity system for visual representation.

### Actor Hierarchy

```
GameActor (Base Class)
├── StaticActor
│   ├── BlockActor
│   ├── CheckpointActor
│   ├── FinishPortalActor
│   └── LazerActor
├── DynamicActor
│   ├── PlayerActor
│   ├── BouncyBallActor
│   └── PowerupActor
```

### Actor-Entity Relationship

Each backend entity has a corresponding frontend actor:

| Backend Entity    | Frontend Actor    | Purpose                       |
| ----------------- | ----------------- | ----------------------------- |
| `PlayerEntity`    | `PlayerActor`     | Player vehicle representation |
| `BlockEntity`     | `BlockActor`      | Obstacle visualization        |
| `BouncyBallActor` | `BouncyBallActor` | Physics object rendering      |
| `PowerupEntity`   | `PowerupActor`    | Power-up visualization        |

### Actor Base Class (`packages/client-logic/src/core/actors/GameActor.js`)

```javascript
export class GameActor {
  constructor(config) {
    this.id = config.id;
    this.position = config.position;
    this.size = config.size;
    this.type = config.type;
  }

  update(state) {
    /* Update actor based on server state */
  }
  render(p5) {
    /* Render actor to canvas */
  }
}
```

## 🎮 Game Renderer (Frontend)

The `GameRenderer` class (`packages/client-logic/src/core/rendering/GameRenderer.js`) is the main frontend component that:

### Key Responsibilities

1. **State Management** - Receives and processes server state updates
2. **Actor Management** - Creates and manages frontend actors
3. **Rendering** - Handles all visual rendering using p5.js
4. **Camera Control** - Manages game camera and viewport
5. **UI Integration** - Handles game UI elements (lives, boost, etc.)

### Core Methods

```javascript
class GameRenderer {
  constructor(config) {
    this.actors = [];
    this.id_actor_map = new Map();
    this.type_actor_map = new Map();
    this.camera = null;
  }

  async setup(p5Instance, gameInfo) {
    /* Initialize renderer */
  }
  update() {
    /* Main render loop */
  }
  updateState(state) {
    /* Process server state updates */
  }
  removePlayer(playerId) {
    /* Remove disconnected player */
  }
}
```

## 🔄 State Synchronization

### State Flow

1. **Server State** - Backend maintains authoritative game state
2. **State Transmission** - Server sends state updates via WebSocket
3. **Client Processing** - Frontend processes state and updates actors
4. **Visual Rendering** - Actors render based on current state

### State Management Process

```javascript
// Server sends state update
io.to(gameId).emit("gameState", {
  players: playerStates,
  entities: entityStates,
  gameState: currentGameState,
});

// Client receives and processes
gameRenderer.updateState(receivedState);
```

### Change Tracking

The backend tracks changes to optimize network traffic:

```javascript
// Backend tracks changes
this.changed_actors = new Set();
this.new_actors = new Set();
this.removed_actors = new Set();

// Only send changed data
io.to(gameId).emit("stateChanges", {
  changed: Array.from(this.changed_actors),
  new: Array.from(this.new_actors),
  removed: Array.from(this.removed_actors),
});
```

## 🎯 Game Creation Process

### 1. Game Initialization

```javascript
// Server creates new game
const game = new Game({
  type: "race",
  mapName: "island_circuit",
});

// Game loads map and sets up entities
game.setup();
```

### 2. Player Joining

```javascript
// Player connects to game
game.addPlayer(socket, userData, playerId);

// Player gets spawn point and initial state
const spawnPoint = game.getRandomSpawnPoint();
const playerEntity = new PlayerEntity({
  position: spawnPoint.position,
  playerId: playerId,
  game: game,
});
```

### 3. Game Start

```javascript
// Game starts when enough players join
if (game.getPlayerCount() >= game.requiredPlayers) {
  game.start(io);
  game.state = "playing";
}
```

## 🎨 Rendering Pipeline

### 1. State Reception

- WebSocket receives server state updates
- `GameRenderer.updateState()` processes changes

### 2. Actor Updates

- Actors receive new state data
- Actors update their visual representation

### 3. Rendering

- `GameRenderer.update()` calls render loop
- Each actor renders itself using p5.js
- Camera applies transformations
- UI elements render on top

### 4. Display

- Canvas displays final rendered frame
- Process repeats at 60 FPS

## 🔧 Physics Integration

### Collision Detection

The physics system uses **BoundingBox** for efficient collision detection:

```javascript
export class BoundingBox {
  constructor(entity) {
    this.entity = entity;
    this.size = entity.size;
    this.left = entity.position.x;
    this.right = entity.position.x + this.size.x;
    this.top = entity.position.y;
    this.bottom = entity.position.y + this.size.y;
  }

  intersects(other) {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}
```

### Physics Update Loop

```javascript
// Physics world update
physicsWorld.update();

// Each entity updates
entities.forEach(entity => {
  const oldPosition = entity.position;
  entity.update();

  // Check for changes
  if (oldPosition !== entity.position) {
    entity.game.markActorChanged(entity);
  }
});
```

## 🗺️ Map System

### Map Scripts (`apps/server/src/game/Map.js`)

Maps are defined using script-based configuration:

```javascript
const mapScript = {
  dimensions: { width: 1000, height: 800 },
  entities: [
    {
      type: "spawn_point",
      parameters: { position: { x: 100, y: 100 } },
    },
    {
      type: "block",
      parameters: {
        position: { x: 200, y: 200 },
        size: { x: 50, y: 50 },
      },
    },
  ],
};
```

### Map Loading Process

1. **Script Loading** - Load map script from configuration
2. **Entity Creation** - Create entities based on script
3. **Spawn Point Setup** - Configure player spawn locations
4. **Physics Setup** - Add entities to physics world

## 🎮 Game Types

### Race Mode

- **Objective**: Complete laps around the track
- **Checkpoints**: Progress tracking points
- **Finish Portal**: Victory condition
- **Time Tracking**: Lap and race timing

### Battle Mode

- **Objective**: Eliminate other players
- **Power-ups**: Strategic gameplay elements
- **Health System**: Player damage and elimination
- **Arena Design**: Combat-focused maps

## 🔄 Real-time Features

### WebSocket Communication

- **Bidirectional**: Client-server real-time communication
- **Event-based**: Specific events for different game actions
- **Optimized**: Only send changed data to reduce bandwidth

### Latency Handling

- **Client Prediction**: Frontend predicts movement for responsiveness
- **Server Reconciliation**: Backend corrects client predictions
- **Interpolation**: Smooth visual updates between server ticks

## 🎯 Performance Optimization

### Spatial Optimization

- **Tile Map System**: Grid-based spatial partitioning
- **Bounding Box Culling**: Only process visible entities
- **Change Tracking**: Only sync changed entities

### Network Optimization

- **Delta Updates**: Only send changed state
- **Compression**: Optimize WebSocket payload size
- **Throttling**: Limit update frequency based on network

---

_The game engine provides a robust foundation for real-time multiplayer gameplay with efficient physics, state management, and cross-platform rendering._
