# State Management

## Overview

The Bumper Vehicles project implements a sophisticated state management system that coordinates between client-side game rendering, server-side physics simulation, and UI state management. The system uses a delta-based synchronization approach to minimize network traffic while maintaining real-time responsiveness.

## Architecture Overview

### State Management Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Client-Side State                       │
├─────────────────────────────────────────────────────────────┤
│  UI State (SceneManager)  │  Game State (GameRenderer)    │
│  • Current Scene          │  • Player Positions           │
│  • UI Components         │  • Entity States              │
│  • User Input            │  • Physics Objects            │
│  • Navigation            │  • Animation States           │
└─────────────────────────────────────────────────────────────┘
                              │
                    WebSocket Connection
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Server-Side State                       │
├─────────────────────────────────────────────────────────────┤
│  Game Engine State        │  Session State                │
│  • Physics World          │  • Player Sessions            │
│  • Entity Management      │  • Game Settings              │
│  • Collision Detection    │  • Match State                │
│  • Game Logic            │  • Connection Management       │
└─────────────────────────────────────────────────────────────┘
```

## Client-Side State Management

### GameRenderer State

The `GameRenderer` class manages the core game state on the client:

```javascript
// packages/client-logic/src/core/rendering/GameRenderer.js
class GameRenderer {
  constructor() {
    this.gameState = {
      // Core game data
      sessionId: null,
      gameStatus: "waiting", // waiting, active, paused, ended
      timeRemaining: 0,

      // Player data
      players: new Map(),
      localPlayerId: null,

      // Entity data
      entities: new Map(),
      powerups: new Map(),
      obstacles: new Map(),

      // Physics data
      physicsWorld: null,
      collisionGroups: new Map(),

      // Rendering data
      camera: null,
      viewport: { width: 800, height: 600 },

      // Animation data
      animations: new Map(),
      particleSystems: new Map(),

      // UI state
      uiState: {
        showHUD: true,
        showMinimap: true,
        showChat: false,
        currentMenu: null,
      },
    };

    this.stateHistory = [];
    this.maxHistorySize = 10;
  }

  // State update methods
  updateGameState(newState) {
    // Store previous state for interpolation
    this.stateHistory.push({ ...this.gameState });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    // Apply delta updates
    this.applyDeltaUpdate(newState);

    // Trigger state change events
    this.emit("stateChanged", this.gameState);
  }

  applyDeltaUpdate(deltaState) {
    // Update only changed properties
    Object.keys(deltaState).forEach(key => {
      if (this.gameState[key] !== deltaState[key]) {
        this.gameState[key] = deltaState[key];
      }
    });

    // Handle special cases
    if (deltaState.players) {
      this.updatePlayers(deltaState.players);
    }

    if (deltaState.entities) {
      this.updateEntities(deltaState.entities);
    }
  }

  updatePlayers(playersData) {
    playersData.forEach(playerData => {
      const existingPlayer = this.gameState.players.get(playerData.id);

      if (existingPlayer) {
        // Update existing player
        Object.assign(existingPlayer, playerData);
      } else {
        // Add new player
        this.gameState.players.set(playerData.id, playerData);
        this.createPlayerActor(playerData);
      }
    });
  }

  updateEntities(entitiesData) {
    entitiesData.forEach(entityData => {
      const existingEntity = this.gameState.entities.get(entityData.id);

      if (existingEntity) {
        // Update existing entity
        Object.assign(existingEntity, entityData);
      } else {
        // Add new entity
        this.gameState.entities.set(entityData.id, entityData);
        this.createEntityActor(entityData);
      }
    });
  }

  // State query methods
  getPlayerState(playerId) {
    return this.gameState.players.get(playerId);
  }

  getEntityState(entityId) {
    return this.gameState.entities.get(entityId);
  }

  getLocalPlayerState() {
    return this.gameState.players.get(this.gameState.localPlayerId);
  }

  // State validation
  validateState(state) {
    const errors = [];

    if (!state.sessionId) {
      errors.push("Missing session ID");
    }

    if (state.players && !Array.isArray(state.players)) {
      errors.push("Players must be an array");
    }

    return errors;
  }
}
```

### SceneManager State

The `SceneManager` handles UI state and scene transitions:

```javascript
// packages/client-logic/src/core/event-management/SceneManager.js
class SceneManager {
  constructor() {
    this.currentScene = null;
    this.previousScene = null;
    this.sceneStack = [];

    this.uiState = {
      // Navigation state
      currentRoute: "/",
      navigationHistory: [],

      // Modal state
      activeModals: new Set(),
      modalStack: [],

      // Form state
      formData: new Map(),
      formErrors: new Map(),

      // Loading state
      loadingStates: new Map(),

      // User preferences
      userPreferences: {
        soundEnabled: true,
        musicVolume: 0.8,
        graphicsQuality: "high",
        language: "en",
      },
    };

    this.scenes = new Map();
    this.transitions = new Map();
  }

  // Scene state management
  setCurrentScene(sceneName, params = {}) {
    this.previousScene = this.currentScene;
    this.currentScene = sceneName;

    // Update navigation history
    this.uiState.navigationHistory.push({
      scene: sceneName,
      params: params,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.uiState.navigationHistory.length > 50) {
      this.uiState.navigationHistory.shift();
    }

    // Trigger scene change event
    this.emit("sceneChanged", {
      from: this.previousScene,
      to: this.currentScene,
      params: params,
    });
  }

  // UI state management
  setUIState(key, value) {
    this.uiState[key] = value;
    this.emit("uiStateChanged", { key, value });
  }

  setModalState(modalId, isActive, data = {}) {
    if (isActive) {
      this.uiState.activeModals.add(modalId);
      this.uiState.modalStack.push({ id: modalId, data });
    } else {
      this.uiState.activeModals.delete(modalId);
      this.uiState.modalStack = this.uiState.modalStack.filter(
        modal => modal.id !== modalId
      );
    }

    this.emit("modalStateChanged", { modalId, isActive, data });
  }

  setFormState(formId, data, errors = {}) {
    this.uiState.formData.set(formId, data);
    this.uiState.formErrors.set(formId, errors);

    this.emit("formStateChanged", { formId, data, errors });
  }

  setLoadingState(key, isLoading, message = "") {
    this.uiState.loadingStates.set(key, { isLoading, message });
    this.emit("loadingStateChanged", { key, isLoading, message });
  }

  // State persistence
  saveUserPreferences() {
    localStorage.setItem(
      "userPreferences",
      JSON.stringify(this.uiState.userPreferences)
    );
  }

  loadUserPreferences() {
    const saved = localStorage.getItem("userPreferences");
    if (saved) {
      this.uiState.userPreferences = {
        ...this.uiState.userPreferences,
        ...JSON.parse(saved),
      };
    }
  }

  // State query methods
  getCurrentScene() {
    return this.currentScene;
  }

  getUIState(key) {
    return this.uiState[key];
  }

  isModalActive(modalId) {
    return this.uiState.activeModals.has(modalId);
  }

  getFormData(formId) {
    return this.uiState.formData.get(formId);
  }

  getFormErrors(formId) {
    return this.uiState.formErrors.get(formId);
  }

  isLoading(key) {
    const state = this.uiState.loadingStates.get(key);
    return state ? state.isLoading : false;
  }
}
```

## Server-Side State Management

### Game State Management

The server manages game state through the `Game` class:

```javascript
// apps/server/src/game/Game.js
class Game {
  constructor(sessionId, config) {
    this.sessionId = sessionId;
    this.config = config;

    this.gameState = {
      // Session information
      sessionId: sessionId,
      status: "waiting", // waiting, active, paused, ended
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,

      // Game settings
      gameType: config.gameType || "multiplayer",
      mapId: config.mapId || "default",
      maxPlayers: config.maxPlayers || 4,
      timeLimit: config.timeLimit || 300,

      // Player management
      players: new Map(),
      playerSessions: new Map(),

      // Physics world
      physicsWorld: new PhysicsWorld(),

      // Entity management
      entities: new Map(),
      entityCounter: 0,

      // Game logic state
      gameLogic: {
        powerupSpawnTimer: 0,
        scoreMultiplier: 1.0,
        gameEvents: [],
      },

      // Match state
      matchState: {
        roundNumber: 1,
        totalRounds: 3,
        roundStartTime: null,
        roundEndTime: null,
      },
    };

    this.stateHistory = [];
    this.maxHistorySize = 20;

    // Initialize physics world
    this.initializePhysicsWorld();
  }

  // State update methods
  updateGameState(deltaTime) {
    // Update physics
    this.gameState.physicsWorld.update(deltaTime);

    // Update game logic
    this.updateGameLogic(deltaTime);

    // Update player states
    this.updatePlayerStates();

    // Update entity states
    this.updateEntityStates();

    // Store state history
    this.storeStateHistory();

    // Emit state updates to clients
    this.emitStateUpdate();
  }

  updateGameLogic(deltaTime) {
    const gameLogic = this.gameState.gameLogic;

    // Update powerup spawn timer
    gameLogic.powerupSpawnTimer += deltaTime;
    if (gameLogic.powerupSpawnTimer >= 10000) {
      // 10 seconds
      this.spawnPowerup();
      gameLogic.powerupSpawnTimer = 0;
    }

    // Update score multiplier
    if (gameLogic.scoreMultiplier > 1.0) {
      gameLogic.scoreMultiplier -= deltaTime * 0.001; // Decay over time
      gameLogic.scoreMultiplier = Math.max(1.0, gameLogic.scoreMultiplier);
    }
  }

  updatePlayerStates() {
    this.gameState.players.forEach((player, playerId) => {
      // Update player physics
      const playerEntity = this.gameState.physicsWorld.getEntity(playerId);
      if (playerEntity) {
        player.position = playerEntity.position;
        player.velocity = playerEntity.velocity;
        player.rotation = playerEntity.rotation;
      }

      // Update player stats
      if (player.health <= 0 && player.isAlive) {
        this.handlePlayerDeath(playerId);
      }
    });
  }

  updateEntityStates() {
    this.gameState.entities.forEach((entity, entityId) => {
      // Update entity physics
      const physicsEntity = this.gameState.physicsWorld.getEntity(entityId);
      if (physicsEntity) {
        entity.position = physicsEntity.position;
        entity.velocity = physicsEntity.velocity;
        entity.rotation = physicsEntity.rotation;
      }

      // Update entity-specific logic
      if (entity.type === "powerup") {
        this.updatePowerup(entity);
      } else if (entity.type === "projectile") {
        this.updateProjectile(entity);
      }
    });
  }

  // State query methods
  getGameState() {
    return {
      sessionId: this.gameState.sessionId,
      status: this.gameState.status,
      timeRemaining: this.getTimeRemaining(),
      players: Array.from(this.gameState.players.values()),
      entities: Array.from(this.gameState.entities.values()),
      gameLogic: this.gameState.gameLogic,
      matchState: this.gameState.matchState,
    };
  }

  getPlayerState(playerId) {
    return this.gameState.players.get(playerId);
  }

  getEntityState(entityId) {
    return this.gameState.entities.get(entityId);
  }

  getTimeRemaining() {
    if (this.gameState.status !== "active") {
      return 0;
    }

    const elapsed = Date.now() - this.gameState.startedAt;
    return Math.max(0, this.gameState.timeLimit * 1000 - elapsed);
  }

  // State modification methods
  addPlayer(playerId, playerData) {
    const player = {
      id: playerId,
      name: playerData.name,
      characterId: playerData.characterId,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      health: 100,
      score: 0,
      isAlive: true,
      powerups: [],
      lastInput: null,
      joinedAt: Date.now(),
    };

    this.gameState.players.set(playerId, player);
    this.gameState.physicsWorld.addPlayer(playerId, player);

    // Emit player joined event
    this.emit("playerJoined", { playerId, player });
  }

  removePlayer(playerId) {
    const player = this.gameState.players.get(playerId);
    if (player) {
      this.gameState.players.delete(playerId);
      this.gameState.physicsWorld.removePlayer(playerId);

      // Emit player left event
      this.emit("playerLeft", { playerId, player });
    }
  }

  updatePlayerInput(playerId, input) {
    const player = this.gameState.players.get(playerId);
    if (player) {
      player.lastInput = input;
      this.gameState.physicsWorld.updatePlayerInput(playerId, input);
    }
  }

  // State persistence
  saveGameState() {
    const stateData = {
      sessionId: this.gameState.sessionId,
      status: this.gameState.status,
      players: Array.from(this.gameState.players.entries()),
      entities: Array.from(this.gameState.entities.entries()),
      gameLogic: this.gameState.gameLogic,
      matchState: this.gameState.matchState,
      timestamp: Date.now(),
    };

    // Save to database
    return this.database.saveGameState(stateData);
  }

  loadGameState(stateData) {
    this.gameState.status = stateData.status;
    this.gameState.players = new Map(stateData.players);
    this.gameState.entities = new Map(stateData.entities);
    this.gameState.gameLogic = stateData.gameLogic;
    this.gameState.matchState = stateData.matchState;

    // Rebuild physics world
    this.rebuildPhysicsWorld();
  }
}
```

### Session State Management

The server manages session state for multiple games:

```javascript
// apps/server/src/game/websocket-manager.js
class WebSocketManager {
  constructor() {
    this.sessions = new Map();
    this.playerSessions = new Map();

    this.sessionState = {
      // Active sessions
      activeSessions: new Set(),
      sessionConfigs: new Map(),

      // Player connections
      playerConnections: new Map(),
      connectionHistory: [],

      // Matchmaking state
      matchmakingQueue: [],
      matchmakingRules: {
        maxWaitTime: 30000,
        minPlayers: 2,
        maxPlayers: 4,
      },
    };
  }

  // Session state management
  createSession(sessionId, config) {
    const session = new Game(sessionId, config);
    this.sessions.set(sessionId, session);
    this.sessionState.activeSessions.add(sessionId);
    this.sessionState.sessionConfigs.set(sessionId, config);

    // Emit session created event
    this.emit("sessionCreated", { sessionId, config });

    return session;
  }

  destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Save final state
      session.saveGameState();

      // Clean up
      this.sessions.delete(sessionId);
      this.sessionState.activeSessions.delete(sessionId);
      this.sessionState.sessionConfigs.delete(sessionId);

      // Emit session destroyed event
      this.emit("sessionDestroyed", { sessionId });
    }
  }

  // Player session management
  addPlayerToSession(playerId, sessionId, playerData) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.addPlayer(playerId, playerData);

      // Track player session
      this.playerSessions.set(playerId, {
        sessionId: sessionId,
        playerData: playerData,
        joinedAt: Date.now(),
      });

      // Track connection
      this.sessionState.playerConnections.set(playerId, {
        sessionId: sessionId,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
      });
    }
  }

  removePlayerFromSession(playerId) {
    const playerSession = this.playerSessions.get(playerId);
    if (playerSession) {
      const session = this.sessions.get(playerSession.sessionId);
      if (session) {
        session.removePlayer(playerId);
      }

      // Clean up player tracking
      this.playerSessions.delete(playerId);
      this.sessionState.playerConnections.delete(playerId);
    }
  }

  // State query methods
  getSessionState(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.getGameState() : null;
  }

  getPlayerSession(playerId) {
    return this.playerSessions.get(playerId);
  }

  getActiveSessions() {
    return Array.from(this.sessionState.activeSessions);
  }

  getSessionConfig(sessionId) {
    return this.sessionState.sessionConfigs.get(sessionId);
  }

  // State monitoring
  updateConnectionActivity(playerId) {
    const connection = this.sessionState.playerConnections.get(playerId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  cleanupInactiveConnections(timeout = 300000) {
    // 5 minutes
    const now = Date.now();
    const inactivePlayers = [];

    this.sessionState.playerConnections.forEach((connection, playerId) => {
      if (now - connection.lastActivity > timeout) {
        inactivePlayers.push(playerId);
      }
    });

    inactivePlayers.forEach(playerId => {
      this.removePlayerFromSession(playerId);
    });

    return inactivePlayers.length;
  }
}
```

## State Synchronization

### Delta-Based Updates

The system uses delta-based updates to minimize network traffic:

```javascript
// Client-side delta application
class StateSynchronizer {
  constructor(gameRenderer) {
    this.gameRenderer = gameRenderer;
    this.lastReceivedState = null;
    this.pendingUpdates = [];
  }

  applyDeltaUpdate(deltaState) {
    // Validate delta state
    if (!this.validateDeltaState(deltaState)) {
      console.warn("Invalid delta state received:", deltaState);
      return;
    }

    // Apply delta to current state
    this.gameRenderer.updateGameState(deltaState);

    // Store for interpolation
    this.lastReceivedState = deltaState;

    // Process pending updates
    this.processPendingUpdates();
  }

  validateDeltaState(deltaState) {
    if (!deltaState.sessionId) {
      return false;
    }

    if (deltaState.players && !Array.isArray(deltaState.players)) {
      return false;
    }

    if (deltaState.entities && !Array.isArray(deltaState.entities)) {
      return false;
    }

    return true;
  }

  // State interpolation for smooth rendering
  interpolateState(alpha) {
    if (!this.lastReceivedState || this.pendingUpdates.length === 0) {
      return;
    }

    const interpolatedState = {};

    // Interpolate player positions
    if (this.lastReceivedState.players) {
      interpolatedState.players = this.lastReceivedState.players.map(player => {
        const previousPlayer = this.findPreviousPlayer(player.id);
        if (previousPlayer) {
          return this.interpolatePlayer(player, previousPlayer, alpha);
        }
        return player;
      });
    }

    // Interpolate entity positions
    if (this.lastReceivedState.entities) {
      interpolatedState.entities = this.lastReceivedState.entities.map(
        entity => {
          const previousEntity = this.findPreviousEntity(entity.id);
          if (previousEntity) {
            return this.interpolateEntity(entity, previousEntity, alpha);
          }
          return entity;
        }
      );
    }

    // Apply interpolated state
    this.gameRenderer.updateGameState(interpolatedState);
  }

  interpolatePlayer(current, previous, alpha) {
    return {
      ...current,
      position: {
        x:
          previous.position.x +
          (current.position.x - previous.position.x) * alpha,
        y:
          previous.position.y +
          (current.position.y - previous.position.y) * alpha,
      },
      rotation:
        previous.rotation + (current.rotation - previous.rotation) * alpha,
    };
  }

  interpolateEntity(current, previous, alpha) {
    return {
      ...current,
      position: {
        x:
          previous.position.x +
          (current.position.x - previous.position.x) * alpha,
        y:
          previous.position.y +
          (current.position.y - previous.position.y) * alpha,
      },
    };
  }
}
```

### Server-Side State Broadcasting

```javascript
// Server-side state broadcasting
class StateBroadcaster {
  constructor(game, io) {
    this.game = game;
    this.io = io;
    this.broadcastInterval = 50; // 20 FPS
    this.lastBroadcastTime = 0;
    this.broadcastQueue = [];
  }

  startBroadcasting() {
    setInterval(() => {
      this.broadcastGameState();
    }, this.broadcastInterval);
  }

  broadcastGameState() {
    const currentTime = Date.now();

    // Get current game state
    const gameState = this.game.getGameState();

    // Create delta update
    const deltaState = this.createDeltaState(gameState);

    // Broadcast to all players in session
    this.game.gameState.players.forEach((player, playerId) => {
      const connection = this.getPlayerConnection(playerId);
      if (connection) {
        connection.socket.emit("game-state-update", deltaState);
      }
    });

    this.lastBroadcastTime = currentTime;
  }

  createDeltaState(currentState) {
    // Only send changed data
    const deltaState = {
      sessionId: currentState.sessionId,
      status: currentState.status,
      timeRemaining: currentState.timeRemaining,
    };

    // Add changed players
    const changedPlayers = this.getChangedPlayers(currentState.players);
    if (changedPlayers.length > 0) {
      deltaState.players = changedPlayers;
    }

    // Add changed entities
    const changedEntities = this.getChangedEntities(currentState.entities);
    if (changedEntities.length > 0) {
      deltaState.entities = changedEntities;
    }

    return deltaState;
  }

  getChangedPlayers(currentPlayers) {
    const changedPlayers = [];

    currentPlayers.forEach(player => {
      const previousPlayer = this.getPreviousPlayerState(player.id);
      if (this.hasPlayerChanged(player, previousPlayer)) {
        changedPlayers.push(player);
      }
    });

    return changedPlayers;
  }

  hasPlayerChanged(current, previous) {
    if (!previous) return true;

    return (
      current.position.x !== previous.position.x ||
      current.position.y !== previous.position.y ||
      current.health !== previous.health ||
      current.score !== previous.score ||
      current.isAlive !== previous.isAlive
    );
  }

  // Event-based state updates
  broadcastEvent(eventType, eventData) {
    const eventMessage = {
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
    };

    this.game.gameState.players.forEach((player, playerId) => {
      const connection = this.getPlayerConnection(playerId);
      if (connection) {
        connection.socket.emit("game-event", eventMessage);
      }
    });
  }
}
```

## State Persistence

### Client-Side Persistence

```javascript
// Client-side state persistence
class StatePersistence {
  constructor() {
    this.storageKey = "bumper_vehicles_state";
    this.autoSaveInterval = 30000; // 30 seconds
  }

  saveGameState(gameState) {
    const stateData = {
      gameState: gameState,
      timestamp: Date.now(),
      version: "1.0.0",
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stateData));
      return true;
    } catch (error) {
      console.error("Failed to save game state:", error);
      return false;
    }
  }

  loadGameState() {
    try {
      const stateData = localStorage.getItem(this.storageKey);
      if (stateData) {
        const parsed = JSON.parse(stateData);

        // Validate version compatibility
        if (parsed.version === "1.0.0") {
          return parsed.gameState;
        }
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    }

    return null;
  }

  clearGameState() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("Failed to clear game state:", error);
      return false;
    }
  }

  // Auto-save functionality
  startAutoSave(gameRenderer) {
    setInterval(() => {
      const gameState = gameRenderer.getGameState();
      this.saveGameState(gameState);
    }, this.autoSaveInterval);
  }
}
```

### Server-Side Persistence

```javascript
// Server-side state persistence
class GameStatePersistence {
  constructor(database) {
    this.database = database;
    this.saveInterval = 60000; // 1 minute
    this.maxSaveHistory = 10;
  }

  async saveGameState(game) {
    const stateData = {
      sessionId: game.gameState.sessionId,
      status: game.gameState.status,
      players: Array.from(game.gameState.players.entries()),
      entities: Array.from(game.gameState.entities.entries()),
      gameLogic: game.gameState.gameLogic,
      matchState: game.gameState.matchState,
      timestamp: Date.now(),
    };

    try {
      await this.database.saveGameState(stateData);
      return true;
    } catch (error) {
      console.error("Failed to save game state:", error);
      return false;
    }
  }

  async loadGameState(sessionId) {
    try {
      const stateData = await this.database.loadGameState(sessionId);
      return stateData;
    } catch (error) {
      console.error("Failed to load game state:", error);
      return null;
    }
  }

  // Periodic save for active games
  startPeriodicSave(games) {
    setInterval(() => {
      games.forEach(game => {
        if (game.gameState.status === "active") {
          this.saveGameState(game);
        }
      });
    }, this.saveInterval);
  }
}
```

## State Validation and Error Handling

### State Validation

```javascript
// State validation utilities
class StateValidator {
  static validateGameState(state) {
    const errors = [];

    // Required fields
    if (!state.sessionId) {
      errors.push("Missing session ID");
    }

    if (!state.status) {
      errors.push("Missing game status");
    }

    // Validate players
    if (state.players) {
      if (!Array.isArray(state.players)) {
        errors.push("Players must be an array");
      } else {
        state.players.forEach((player, index) => {
          const playerErrors = this.validatePlayer(player);
          playerErrors.forEach(error => {
            errors.push(`Player ${index}: ${error}`);
          });
        });
      }
    }

    // Validate entities
    if (state.entities) {
      if (!Array.isArray(state.entities)) {
        errors.push("Entities must be an array");
      } else {
        state.entities.forEach((entity, index) => {
          const entityErrors = this.validateEntity(entity);
          entityErrors.forEach(error => {
            errors.push(`Entity ${index}: ${error}`);
          });
        });
      }
    }

    return errors;
  }

  static validatePlayer(player) {
    const errors = [];

    if (!player.id) {
      errors.push("Missing player ID");
    }

    if (!player.name) {
      errors.push("Missing player name");
    }

    if (
      !player.position ||
      typeof player.position.x !== "number" ||
      typeof player.position.y !== "number"
    ) {
      errors.push("Invalid player position");
    }

    if (
      typeof player.health !== "number" ||
      player.health < 0 ||
      player.health > 100
    ) {
      errors.push("Invalid player health");
    }

    return errors;
  }

  static validateEntity(entity) {
    const errors = [];

    if (!entity.id) {
      errors.push("Missing entity ID");
    }

    if (!entity.type) {
      errors.push("Missing entity type");
    }

    if (
      !entity.position ||
      typeof entity.position.x !== "number" ||
      typeof entity.position.y !== "number"
    ) {
      errors.push("Invalid entity position");
    }

    return errors;
  }
}
```

### Error Recovery

```javascript
// State error recovery
class StateRecovery {
  constructor(gameRenderer) {
    this.gameRenderer = gameRenderer;
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
  }

  handleStateError(error, state) {
    console.error("State error:", error);

    if (this.recoveryAttempts < this.maxRecoveryAttempts) {
      this.recoveryAttempts++;

      // Try to recover from backup state
      const backupState = this.getBackupState();
      if (backupState) {
        this.gameRenderer.updateGameState(backupState);
        console.log("Recovered from backup state");
        return true;
      }

      // Try to repair corrupted state
      const repairedState = this.repairState(state);
      if (repairedState) {
        this.gameRenderer.updateGameState(repairedState);
        console.log("Repaired corrupted state");
        return true;
      }
    }

    // Reset to initial state
    this.resetToInitialState();
    return false;
  }

  repairState(corruptedState) {
    try {
      // Remove invalid players
      if (corruptedState.players) {
        corruptedState.players = corruptedState.players.filter(
          player => player && player.id && player.position
        );
      }

      // Remove invalid entities
      if (corruptedState.entities) {
        corruptedState.entities = corruptedState.entities.filter(
          entity => entity && entity.id && entity.position
        );
      }

      // Ensure required fields
      if (!corruptedState.sessionId) {
        corruptedState.sessionId = "recovered_session";
      }

      if (!corruptedState.status) {
        corruptedState.status = "waiting";
      }

      return corruptedState;
    } catch (error) {
      console.error("Failed to repair state:", error);
      return null;
    }
  }

  resetToInitialState() {
    this.gameRenderer.resetGameState();
    this.recoveryAttempts = 0;
    console.log("Reset to initial state");
  }
}
```

This comprehensive state management system provides robust coordination between client and server, efficient synchronization, and reliable error recovery mechanisms for the Bumper Vehicles game.
