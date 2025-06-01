export default class GameState {
  constructor(physicsEngine) {
    this.players = {};
    this.disconnectedPlayers = new Map(); // Map of playerId -> disconnect data
    this.RECONNECT_TIMEOUT = 5000; // 5 seconds to reconnect
    this.physicsEngine = physicsEngine;
  }

  addPlayer(socketId, playerId = null) {
    // If no playerId provided, generate one
    if (!playerId) {
      playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    }

    const x = Math.random() * 700 + 50;
    const y = Math.random() * 500 + 50;
    const player = this.physicsEngine.createPlayer(socketId, x, y);
    player.playerId = playerId; // Store the persistent player ID
    this.players[socketId] = player;
    console.log(`Created new player with ID: ${playerId} and socket: ${socketId}`);
    return player;
  }

  handleDisconnect(socketId) {
    if (this.players[socketId]) {
      const player = this.players[socketId];
      console.log(`Storing disconnected player: ${player.playerId}`);
      // Store player data and timestamp using the persistent playerId
      this.disconnectedPlayers.set(player.playerId, {
        player: { ...player, socketId: null }, // Remove socketId from stored data
        timestamp: Date.now()
      });
      // Keep the player in the game state but mark them as disconnected
      player.disconnected = true;
      player.disconnectedAt = Date.now();
    }
  }

  handleReconnect(socketId, playerId) {
    console.log(`Attempting to reconnect player: ${playerId} with socket: ${socketId}`);
    const disconnectedData = this.disconnectedPlayers.get(playerId);
    if (disconnectedData) {
      // Check if within reconnect window
      if (Date.now() - disconnectedData.timestamp <= this.RECONNECT_TIMEOUT) {
        console.log(`Reconnection successful for player: ${playerId}`);
        // Find the existing player in the game state
        const existingPlayer = Object.values(this.players).find(p => p.playerId === playerId);
        if (existingPlayer) {
          // Update the socket ID and remove disconnected status
          existingPlayer.socketId = socketId;
          existingPlayer.disconnected = false;
          existingPlayer.disconnectedAt = null;
          // Update the players object with the new socket ID
          this.players[socketId] = existingPlayer;
          // Remove from disconnected players
          this.disconnectedPlayers.delete(playerId);
          return true;
        }
      } else {
        console.log(`Reconnection timeout for player: ${playerId}`);
      }
    } else {
      console.log(`No disconnected data found for player: ${playerId}`);
    }
    return false;
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      const playerId = this.players[socketId].playerId;
      this.disconnectedPlayers.delete(playerId);
    }
    delete this.players[socketId];
  }

  updatePlayerInput(socketId, input) {
    if (this.players[socketId]) {
      this.players[socketId].pendingInput = input;
    }
  }

  processPhysics() {
    // Check for expired reconnection attempts
    const now = Date.now();
    for (const [playerId, data] of this.disconnectedPlayers.entries()) {
      if (now - data.timestamp > this.RECONNECT_TIMEOUT) {
        console.log(`Removing expired reconnection attempt for player: ${playerId}`);
        // Find and remove the player from the game state
        const playerToRemove = Object.values(this.players).find(p => p.playerId === playerId);
        if (playerToRemove) {
          delete this.players[playerToRemove.socketId];
        }
        this.disconnectedPlayers.delete(playerId);
      }
    }

    // Process active players
    Object.values(this.players).forEach(player => {
      if (player.pendingInput && !player.disconnected) {
        this.physicsEngine.processPlayerMovement(player, player.pendingInput);
        player.pendingInput = null;
      }
    });
  }

  getState() {
    return {
      players: this.players
    };
  }
} 