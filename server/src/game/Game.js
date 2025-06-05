import { PlayerEntity } from './PlayerEntity.js';
import { Vec2 } from '../utils/vector.js';

export default class Game {
  constructor(physicsWorld, requiredPlayers, type) {
    this.physicsWorld = physicsWorld;
    this.requiredPlayers = requiredPlayers;
    this.type = type; // 'race' or 'battle'
    this.state = 'waiting'; // 'waiting' or 'playing'
    this.players = new Map();
    this.disconnectedPlayers = new Map();
    this.RECONNECT_TIMEOUT = 5000; // 5 seconds to reconnect
    this.lastCleanupTime = Date.now();
    this.CLEANUP_INTERVAL = 1000; // Check for timed-out players every second
  }

  addPlayer(socketId) {
    // Generate random position within the game area
    const x = Math.random() * 700 + 50; // Random x between 50 and 750
    const y = Math.random() * 500 + 50; // Random y between 50 and 550
    const position = new Vec2(x, y);
    const size = new Vec2(32, 32); // Standard player size

    const player = new PlayerEntity(position, size);
    player.socketId = socketId;
    player.playerId = 'player_' + Math.random().toString(36).substr(2, 9);

    this.players.set(socketId, player);
    this.physicsWorld.addEntity(player);

    const shouldStartGame = this.players.size >= this.requiredPlayers;
    return { player, shouldStartGame };
  }

  handleDisconnect(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      player.disconnected = true;
      this.disconnectedPlayers.set(player.playerId, player);
    }
  }

  handleReconnect(socketId, playerId) {
    const player = this.players.get(socketId);
    if (player && player.playerId === playerId) {
      player.disconnected = false;
      return { success: true };
    }
    return { success: false };
  }

  // immediately delete a player from game
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      this.physicsWorld.removeEntity(player);
      this.players.delete(socketId);
    }
  }

  getPlayerBySocketId(socketId) {
    return this.players.get(socketId);
  }

  getPlayerByPlayerId(playerId) {
    for (const player of this.players.values()) {
      if (player.playerId === playerId) {
        return player;
      }
    }
    return null;
  }

  getPlayerCount() {
    return this.players.size;
  }

  update() {
    // Update all players
    this.players.forEach(player => {
      if (!player.disconnected) {
        player.update();
      }
    });
  }

  getSetup() {
    const players = {};
    this.players.forEach((player, socketId) => {
      players[socketId] = {
        playerId: player.playerId,
        x: player.position.x,
        y: player.position.y,
        disconnected: player.disconnected
      };
    });

    return { players };
  }

  getState() {
    const players = {};
    this.players.forEach((player, socketId) => {
      players[socketId] = {
        playerId: player.playerId,
        x: player.position.x,
        y: player.position.y,
        disconnected: player.disconnected
      };
    });
    return { players };
  }

  cleanupDisconnectedPlayers() {
    const now = Date.now();
    if (now - this.lastCleanupTime < this.CLEANUP_INTERVAL) {
      return null;
    }
    this.lastCleanupTime = now;

    // Check for timed-out players
    for (const [playerId, data] of this.disconnectedPlayers.entries()) {
      if (now - data.timestamp > this.RECONNECT_TIMEOUT) {
        console.log(`Player ${playerId} timed out, removing from game`);
        this.disconnectedPlayers.delete(playerId);

        // Find and remove the player from the game
        const playerEntry = Object.entries(this.players).find(([_, p]) => p.playerId === playerId);
        if (playerEntry) {
          const [socketId, player] = playerEntry;
          this.physicsWorld.removeEntity(player);
          this.players.delete(socketId);
          return { playerId, socketId }; // Return info about removed player
        }
      }
    }
    return null;
  }
} 