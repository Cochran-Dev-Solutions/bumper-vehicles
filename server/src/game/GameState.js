export default class GameState {
  constructor(physicsEngine) {
    this.players = {};
    this.physicsEngine = physicsEngine;
  }

  addPlayer(socketId) {
    const x = Math.random() * 700 + 50;
    const y = Math.random() * 500 + 50;
    this.players[socketId] = this.physicsEngine.createPlayer(socketId, x, y);
    return this.players[socketId];
  }

  removePlayer(socketId) {
    delete this.players[socketId];
  }

  updatePlayerInput(socketId, input) {
    if (this.players[socketId]) {
      this.players[socketId].pendingInput = input;
    }
  }

  processPhysics() {
    Object.values(this.players).forEach(player => {
      if (player.pendingInput) {
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