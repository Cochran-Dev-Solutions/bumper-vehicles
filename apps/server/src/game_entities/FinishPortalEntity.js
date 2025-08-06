import { Entity } from "./Entity.js";
import { Vec2 } from "../utils/vector.js";

export class FinishPortalEntity extends Entity {
  constructor(config) {
    super({
      ...config,
      type: "finish_portal",
      type_of_actor: "passive_static",
      hasUpdate: false
    });

    this.radius = config.radius || 40;
    this.finishedPlayers = new Set(); // Track which players have finished
    this.animationTime = 0; // For portal animation
  }

  /**
   * Check if a player has collided with this finish portal
   * @param {PlayerEntity} player - The player to check collision with
   * @returns {boolean} True if collision detected
   */
  checkCollision(player) {
    const distance = this.position.distance(player.position);
    return distance <= (this.radius + player.radius);
  }

  /**
   * Mark a player as finished
   * @param {string} playerId - The ID of the player who finished
   * @returns {number} The placement (1st, 2nd, etc.)
   */
  finishPlayer(playerId) {
    if (!this.finishedPlayers.has(playerId)) {
      this.finishedPlayers.add(playerId);
      this.game.markActorChanged(this);
      return this.finishedPlayers.size; // Return placement
    }
    return null; // Player already finished
  }

  /**
   * Check if a specific player has finished
   * @param {string} playerId - The player ID to check
   * @returns {boolean} True if the player has finished
   */
  hasPlayerFinished(playerId) {
    return this.finishedPlayers.has(playerId);
  }

  /**
   * Get the number of players who have finished
   * @returns {number} Number of finished players
   */
  getFinishedCount() {
    return this.finishedPlayers.size;
  }

  /**
   * Get the list of finished players in order
   * @returns {Array} Array of player IDs in finish order
   */
  getFinishedPlayers() {
    return Array.from(this.finishedPlayers);
  }

  update() {
    // Update animation time for portal effect
    this.animationTime += 16; // Assuming 60fps
    if (this.animationTime > 1000) {
      this.animationTime = 0;
    }
  }

  getInitialState() {
    return {
      id: this.id,
      type: this.type,
      type_of_actor: this.type_of_actor,
      x: this.position.x,
      y: this.position.y,
      radius: this.radius,
      finishedPlayers: Array.from(this.finishedPlayers),
      animationTime: this.animationTime
    };
  }

  getUpdatedState() {
    return {
      id: this.id,
      finishedPlayers: Array.from(this.finishedPlayers),
      animationTime: this.animationTime
    };
  }
} 