import { Entity } from "./Entity.js";
import { Vec2 } from "../utils/vector.js";

export class CheckpointEntity extends Entity {
  constructor(config) {
    super({
      ...config,
      type: "checkpoint",
      type_of_actor: "passive_static",
      hasUpdate: false
    });

    this.radius = config.radius || 30;
    this.checkpointId = config.checkpointId || 0;
    this.activated = false;
    this.activatedBy = new Set(); // Track which players have activated this checkpoint
  }

  /**
   * Check if a player has collided with this checkpoint
   * @param {PlayerEntity} player - The player to check collision with
   * @returns {boolean} True if collision detected
   */
  checkCollision(player) {
    const distance = this.position.distance(player.position);
    return distance <= (this.radius + player.radius);
  }

  /**
   * Activate checkpoint for a specific player
   * @param {string} playerId - The ID of the player who activated the checkpoint
   */
  activateForPlayer(playerId) {
    if (!this.activatedBy.has(playerId)) {
      this.activatedBy.add(playerId);
      this.activated = true;
      this.game.markActorChanged(this);
    }
  }

  /**
   * Check if a specific player has activated this checkpoint
   * @param {string} playerId - The player ID to check
   * @returns {boolean} True if the player has activated this checkpoint
   */
  isActivatedByPlayer(playerId) {
    return this.activatedBy.has(playerId);
  }

  update() {
    // Checkpoints don't need updates
  }

  getInitialState() {
    return {
      id: this.id,
      type: this.type,
      type_of_actor: this.type_of_actor,
      x: this.position.x,
      y: this.position.y,
      radius: this.radius,
      checkpointId: this.checkpointId,
      activated: this.activated,
      activatedBy: Array.from(this.activatedBy)
    };
  }

  getUpdatedState() {
    return {
      id: this.id,
      activated: this.activated,
      activatedBy: Array.from(this.activatedBy)
    };
  }
} 