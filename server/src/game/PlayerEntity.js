import { PhysicsEntity } from '../physics/PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export class PlayerEntity extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other 
    // entities this distinction is moot
    super(config);
    this.moveForce = 10; // Force to apply for movement
    this.dragCoefficient = 0.2; // Higher drag for more responsive movement
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.disconnected = false;
    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };
    this.socketId = config.socketId;
    this.game = config.game;
  }

  /**
   * Update input state
   * @param {Object} newInput 
   */
  updateInput(newInput) {
    this.input = { ...newInput };

    // Update facing direction based on input
    if (this.input.left) {
      this.flags.facing = 'left';
    } else if (this.input.right) {
      this.flags.facing = 'right';
    }
  }

  /**
   * Process inputs
   */
  handleInputs() {
    if (this.input.left) {
      this.applyForce(new Vec2(-this.moveForce, 0));
    } else if (this.input.right) {
      this.applyForce(new Vec2(this.moveForce, 0));
    }

    if (this.input.up) {
      this.applyForce(new Vec2(0, -this.moveForce));
    } else if (this.input.down) {
      this.applyForce(new Vec2(0, this.moveForce));
    }
  }

  /* 
    * Handle X-axis collision with blocks
    * @returns {boolean} - true if collision occurred
  */
  handleXCollisions() {
    const collidingTiles = this.tileMap.getCollidingTiles('block', this.boundingBox);

    for (const tile of collidingTiles) {
      console.log("X collision: ", tile.position, this.position);
      // Check if moving right and colliding with left side of tile
      if (this.boundingBox.right > tile.position.x) {
        this.position.x = tile.position.x - this.size.x;
        this.boundingBox.updateX();
        this.velocity.x = 0;
        return true;
      }
      // Check if moving left and colliding with right side of tile
      else if (this.boundingBox.left < tile.position.x + tile.size.x) {
        this.position.x = tile.position.x + tile.size.x;
        this.boundingBox.updateX();
        this.velocity.x = 0;
        return true;
      }
    }

    return false;
  }

  /**
   * Handle Y-axis collision with blocks
   * @returns {boolean} - true if collision occurred
   */
  handleYCollisions() {
    const collidingTiles = this.tileMap.getCollidingTiles('block', this.boundingBox);

    for (const tile of collidingTiles) {
      console.log("Y collision: ", tile.position, this.position);
      // Check if moving down and colliding with top of tile
      if (this.boundingBox.bottom > tile.position.y) {
        this.position.y = tile.position.y - this.size.y;
        this.boundingBox.updateY();
        this.velocity.y = 0;
        return true;
      }
      // Check if moving up and colliding with bottom of tile
      else if (this.boundingBox.top < tile.position.y + tile.size.y) {
        this.position.y = tile.position.y + tile.size.y;
        this.boundingBox.updateY();
        this.velocity.y = 0;
        return true;
      }
    }

    return false;
  }

  /**
   * Update player state
   */
  update() {
    if (this.disconnected) return;

    // handle inputs
    this.handleInputs();

    // process forces on player
    this.processForces();

    // Apply drag to slow down when no input
    if (!this.input.left && !this.input.right && !this.input.up && !this.input.down) {
      this.applyDrag(this.dragCoefficient);
    }

    // update X and check for collisions along the x-axis
    this.updateX();
    this.handleXCollisions();

    // update Y and check for collisions along the y-axis
    this.updateY();
    this.handleYCollisions();
  }
} 