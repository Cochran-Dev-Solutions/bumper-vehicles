import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { PlayerEntity } from './PlayerEntity.js';
import mapManager from './Map.js';
import { Vec2 } from '../utils/vector.js';

export default class Game {
  constructor(config) {
    this.physicsWorld = new PhysicsWorld();
    this.type = config.type; // 'race' or 'battle'
    this.mapName = config.mapName || mapManager.getDefaultMap(this.type);
    this.state = 'waiting'; // 'waiting' or 'playing'
    // players to be sent to the front-end
    this.players = new Map();
    // passive actors that have no controls, but have position and size data
    this.passive_actors = []; // all non-player actors
    this.disconnectedPlayers = new Map();
    this.reconnect_timeout = 6000; // 6 seconds to reconnect
    this.playerIdCounter = 0;
    this.passiveActorIdCounter = 0;
    this.changed_actors = new Set();
    this.spawn_points = []; // Will store available spawn points

    // Set up the game immediately
    this.setup();
  }

  /**
   * Generate a unique player ID
   * @returns {string} Unique player ID
   */
  generatePlayerId() {
    return `player_${this.playerIdCounter++}`;
  }

  /**
   * Generate a unique passive actor ID
   * @returns {string} Unique passive actor ID
   */
  generatePassiveActorId() {
    return `actor_${this.passiveActorIdCounter++}`;
  }

  /**
   * Set up the game environment
   */
  setup() {
    // Load the map script
    const script = mapManager.getMapScript('race', this.mapName);
    if (!script) {
      console.error(`Failed to load map script for ${this.mapName}`);
      return;
    }

    // Second pass: create other entities
    script.forEach((instruction) => {
      if (instruction.type === 'spawn_point') {
        this.spawn_points.push(instruction.parameters.position);
        return;
      }

      const EntityConstructor = mapManager.getConstructor(instruction.type);
      if (EntityConstructor) {
        const entity = new EntityConstructor({
          ...instruction.parameters,
          id: this.generatePassiveActorId(),
          tileMap: this.physicsWorld.tileMap,
          game: this
        });
        if (entity.hasUpdate) {
          this.physicsWorld.addEntity(entity);
        }
        this.passive_actors.push(entity);
      }
    });

    // Set required players based on number of spawn points
    this.requiredPlayers = this.spawn_points.length;
    console.log(`Map has ${this.requiredPlayers} spawn points`);
  }

  /**
   * Get a random spawn point and remove it from available spawn points
   * @returns {Vec2|null} The spawn point position or null if no spawn points available
   */
  getRandomSpawnPoint() {
    if (this.spawn_points.length === 0) {
      console.error('No spawn points available');
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.spawn_points.length);
    const spawnPoint = this.spawn_points[randomIndex];
    this.spawn_points.splice(randomIndex, 1); // Remove the used spawn point
    return spawnPoint;
  }

  /**
   * Add a player to the game
   * @param {string} socketId - Socket ID of the player
   * @returns {PlayerEntity} The created player entity
   */
  addPlayer(socketId) {
    const spawnPoint = this.getRandomSpawnPoint();
    if (!spawnPoint) {
      console.error('Cannot add player: no spawn points available');
      return null;
    }

    const player = new PlayerEntity({
      position: spawnPoint,
      size: new Vec2(50, 50),
      socketId: socketId,
      id: this.generatePlayerId(),
      tileMap: this.physicsWorld.tileMap,
      game: this
    });

    this.players.set(socketId, player);
    this.physicsWorld.addEntity(player);

    const shouldStartGame = this.players.size >= this.requiredPlayers;
    return { player, shouldStartGame };
  }

  handleDisconnect(socketId, io) {
    const player = this.players.get(socketId);
    if (player) {
      player.disconnected = true;
      this.disconnectedPlayers.set(player.id, player);

      // Set timeout to remove player after 6 seconds if they haven't reconnected
      setTimeout(() => {
        // Check if player is still disconnected
        if (player.disconnected) {
          console.log(`Player ${player.id} timed out after ${this.reconnect_timeout}ms`);

          // Remove player from game
          this.removePlayer(socketId);

          // Clean up maps
          this.disconnectedPlayers.delete(player.id);

          // Notify all players about the removal
          io.emit('playerRemoved', { playerId: player.id });
        }
      }, this.reconnect_timeout);
    }
  }

  handleReconnect(socketId, playerId) {
    // Find player by playerId instead of socketId
    for (const [oldSocketId, player] of this.players) {
      if (player.id === playerId) {
        // Update the player's socket ID to the new one
        this.players.delete(oldSocketId);
        this.players.set(socketId, player);
        player.disconnected = false;
        player.socketId = socketId;
        this.disconnectedPlayers.delete(playerId);
        return { success: true };
      }
    }
    return { success: false };
  }

  // immediately delete a player from game
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      this.physicsWorld.removeEntity(player);
      this.players.delete(socketId);
      if (player.disconnected) {
        this.disconnectedPlayers.delete(player.id);
      }
    }
  }

  getPlayerBySocketId(socketId) {
    return this.players.get(socketId);
  }

  getPlayerByPlayerId(playerId) {
    for (const player of this.players.values()) {
      if (player.id === playerId) {
        return player;
      }
    }
    return null;
  }

  getPlayerCount() {
    return this.players.size;
  }

  update(io) {
    // Update all players
    this.physicsWorld.update();

    // Send new game state to players
    const newGameState = this.getState();
    this.players.forEach((player, socketId) => {
      io.to(socketId).emit('gameState', newGameState);
    });
  }

  /**
   * Mark an actor as changed
   * @param {Entity} actor - The actor that has changed
   */
  markActorChanged(actor) {
    this.changed_actors.add(actor);
  }

  /**
   * Get state data for all changed actors
   * @returns {Array} Array of actor state data
   */
  getChangedActorsState() {
    const actors = [];

    // Iterate directly over changed actors
    this.changed_actors.forEach(actor => {
      if (actor.socketId) { // It's a player
        actors.push({
          id: actor.id,
          type: 'player',
          x: actor.boundingBox.left,
          y: actor.boundingBox.top,
          width: actor.size.x,
          height: actor.size.y,
          flags: actor.flags
        });
      } else { // It's a passive actor
        actors.push({
          id: actor.id,
          type: actor.type,
          x: actor.boundingBox.left,
          y: actor.boundingBox.top,
          width: actor.size.x,
          height: actor.size.y
        });
      }
    });

    // Clear the changed actors set after getting their state
    this.changed_actors.clear();

    return actors;
  }

  /**
   * Get current game state
   * @returns {Object} Game state data
   */
  getState() {
    return {
      type: this.type,
      actors: this.getChangedActorsState()
    };
  }

  /**
   * Get initial game state
   * @returns {Object} Initial game state data
   */
  getInitialState() {
    return {
      type: this.type,
      players: Array.from(this.players.values()).map(player => ({
        id: player.id,
        x: player.position.x,
        y: player.position.y,
        width: player.size.x,
        height: player.size.y,
        flags: player.flags,
        type: 'player'
      })),
      passive_actors: this.passive_actors.map(actor => ({
        id: actor.id,
        type: actor.type,
        x: actor.position.x,
        y: actor.position.y,
        width: actor.size.x,
        height: actor.size.y
      }))
    };
  }

  start(io) {
    // broadcast initial game state
    this.players.forEach((player, socketId) => {
      console.log(`Sending game setup to player ${player.id} (socket: ${socketId})`);
      io.to(socketId).emit('gameSetup', this.getInitialState());
    });
  }
} 