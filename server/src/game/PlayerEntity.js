import { PhysicsEntity } from '../physics/PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export class PlayerEntity extends PhysicsEntity {
  constructor(position, size, mass = 1) {
    super(position, size, mass);
    this.moveForce = 10; // Force to apply for movement
    this.dragCoefficient = 0.2; // Higher drag for more responsive movement
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.disconnected = false;
  }

  /**
   * Update input state
   * @param {Object} newInput 
   */
  updateInput(newInput) {
    this.input = { ...newInput };
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

  /**
   * Process horizontal movement
   */
  moveX() {
    this.position.x += this.velocity.x;
    this.boundingBox.updateX(this.position.x);
  }

  /**
   * Process vertical movement
   */
  moveY() {
    this.position.y += this.velocity.y;
    this.boundingBox.updateY(this.position.y);
  }

  /**
   * Update player state
   */
  update() {
    // handle inputs
    this.handleInputs();

    // process forces on player
    this.processForces();

    // Apply drag to slow down when no input
    if (!this.input.left && !this.input.right && !this.input.up && !this.input.down) {
      this.applyDrag(this.dragCoefficient);
    }

    this.moveX();
    this.moveY();
  }
} 