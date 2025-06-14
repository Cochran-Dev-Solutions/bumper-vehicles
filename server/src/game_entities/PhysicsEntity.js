import { Entity } from './Entity.js';
import { Vec2 } from '../utils/vector.js';

export class PhysicsEntity extends Entity {
  constructor(config) {
    super({ ...config, type_of_actor: "passive_dynamic" });
    this.dragCoefficient = 0.01; // Higher drag for more responsive movement
    this.mass = config.mass || 1;
    this.velocity = new Vec2(0, 0);
    this.acceleration = new Vec2(0, 0);
    this.maxSpeed = 5; // Default max speed
    this.applyForces = new Vec2(0, 0);
    this.elasticity = config.elasticity || 1;


  }

  /**
   * Apply a force to the entity
   * @param {Vec2} force 
   */
  applyForce(force) {
    this.applyForces = this.applyForces.add(force);
  }

  /**
   * Apply drag force based on velocity
   * @param {number} dragCoefficient 
   */
  applyDrag() {
    // Scale drag force by mass so heavier objects experience more drag
    const dragForce = this.velocity.scale(-this.dragCoefficient * Math.pow(this.mass, 2));
    this.applyForce(dragForce);
  }

  /**
   * Process the forces applied on the entity
   * Update acceleration & velocity respectively
   */
  processForces() {
    // Calculate acceleration from forces
    this.acceleration = this.applyForces.scale(1 / this.mass);

    // Update velocity based on acceleration
    this.velocity = this.velocity.add(this.acceleration);

    // Clamp velocity to max speed
    const speed = this.velocity.magnitude();
    if (speed > this.maxSpeed) {
      this.velocity = this.velocity.normalize().scale(this.maxSpeed);
    }

    // Reset forces
    this.applyForces = new Vec2(0, 0);
  }

  updateX() {
    this.position.x += this.velocity.x;
    this.boundingBox.updateX();
  }

  updateY() {
    this.position.y += this.velocity.y;
    this.boundingBox.updateY();
  }

  /**
   * Handle collisions with tiles/blocks
   * @returns {boolean} true if collision occurred
   */
  handleTileCollisions() {
    const collidingTiles = this.tileMap.getCollidingTiles('block', this.boundingBox);

    for (const tile of collidingTiles) {
      const centerX = this.position.x + this.radius,
        centerY = this.position.y + this.radius;

      const closestX = Math.max(tile.position.x, Math.min(centerX, tile.position.x + tile.size.x));
      const closestY = Math.max(tile.position.y, Math.min(centerY, tile.position.y + tile.size.y));

      // Calculate distance between closest point and circle center
      const distance = Math.sqrt(
        Math.pow(centerX - closestX, 2) +
        Math.pow(centerY - closestY, 2)
      );

      if (distance < this.radius) {
        // Calculate push-out vector
        const pushX = centerX - closestX;
        const pushY = centerY - closestY;
        const pushLength = Math.sqrt(pushX * pushX + pushY * pushY);

        // Normalize and scale by overlap
        const overlap = this.radius - distance;
        const pushVector = new Vec2(
          (pushX / pushLength) * overlap,
          (pushY / pushLength) * overlap
        );

        // Apply push-out
        this.position.x += pushVector.x;
        this.position.y += pushVector.y;
        this.boundingBox.updateX();
        this.boundingBox.updateY();

        // Bounce off the wall
        const normalX = pushX / pushLength;
        const normalY = pushY / pushLength;
        const dot = this.velocity.x * normalX + this.velocity.y * normalY;
        this.velocity.x -= 10 * dot * normalX * this.elasticity;
        this.velocity.y -= 10 * dot * normalY * this.elasticity;

        return true;
      }
    }

    return false;
  }

  /**
   * Handle collision with another circular entity
   * @param {PhysicsEntity} other The other entity to check collision with
   * @returns {boolean} true if collision occurred
   */
  handleCircularCollision(other) {
    // Calculate distance between centers
    const dx = (this.position.x + this.radius) - (other.position.x + other.radius);
    const dy = (this.position.y + this.radius) - (other.position.y + other.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if circles are colliding
    if (distance < (this.radius + other.radius)) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate relative velocity
      const relativeVelocityX = this.velocity.x - other.velocity.x;
      const relativeVelocityY = this.velocity.y - other.velocity.y;
      const relativeSpeed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

      // Calculate velocity along normal
      const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

      // Only resolve if objects are moving towards each other
      if (velocityAlongNormal < 0) {
        // Calculate impulse scalar
        const impulseScalar = -1 * velocityAlongNormal;
        console.log("Impulse Scalar: ", impulseScalar);

        // Calculate impulse vector
        const impulseX = impulseScalar * nx;
        const impulseY = impulseScalar * ny;

        // universal bounce factor for elastic collisions
        const bounceFactor = 200;

        // Apply impulse to both objects, scaled by their mass ratios
        other.velocity.x -= bounceFactor * impulseX * other.elasticity;
        other.velocity.y -= bounceFactor * impulseY * other.elasticity;
        this.velocity.x += bounceFactor * impulseX * this.elasticity;
        this.velocity.y += bounceFactor * impulseY * this.elasticity;

        // Separate the objects to prevent sticking
        const overlap = (this.radius + other.radius) - distance;
        const separationX = nx * overlap * 0.5 * 2;
        const separationY = ny * overlap * 0.5 * 2;

        this.position.x += separationX;
        this.position.y += separationY;
        other.position.x -= separationX;
        other.position.y -= separationY;

        // Update bounding boxes
        this.boundingBox.updateX();
        this.boundingBox.updateY();
        other.boundingBox.updateX();
        other.boundingBox.updateY();

        return true;
      }
    }
    return false;
  }
}