import { Entity } from "./Entity.js";
import { Vec2 } from "../utils/vector.js";

export class PhysicsEntity extends Entity {
  constructor(config) {
    super({ ...config, type_of_actor: "passive_dynamic" });
    this.dragCoefficient = 0.2; // Higher drag for more responsive movement
    this.mass = config.mass || 1;
    this.velocity = new Vec2(0, 0);
    this.acceleration = new Vec2(0, 0);
    // for when a boosted player bumps a physics-bound entity
    this.originalMaxSpeed = 10;
    this.boostMaxSpeed = config.boostMaxSpeed || 20;
    this.maxSpeed = this.originalMaxSpeed;
    this.applyForces = new Vec2(0, 0);
    this.elasticity = config.elasticity || 0.5;

    this.bumpBoostTimer = null;
    this.bumpBoostDuration = 500; // m/s

    this.bounceForce = new Vec2(0, 0);
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
    const dragForce = this.velocity.scale(-this.dragCoefficient);
    this.applyForce(dragForce);
  }

  applyBounces() {
    this.applyForce(this.bounceForce);
  }

  /**
   * Process the forces applied on the entity
   * Update acceleration & velocity respectively
   */
  processForces() {
    this.applyBounces();

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
    this.bounceForce = new Vec2(0, 0);
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
   * Handle collisions with map boundaries
   * @returns {boolean} true if collision occurred
   */
  handleBoundaryCollisions() {
    if (!this.game || !this.game.mapWidth || !this.game.mapHeight) {
      return false;
    }

    let collision = false;

    // Check left boundary
    if (this.boundingBox.left < 0) {
      this.position.x = 0;
      this.velocity.x = -this.velocity.x * this.elasticity;
      collision = true;
    }

    // Check right boundary
    if (this.boundingBox.right > this.game.mapWidth) {
      this.position.x = this.game.mapWidth - this.boundingBox.size.x;
      this.velocity.x = -this.velocity.x * this.elasticity;
      collision = true;
    }

    // Check top boundary
    if (this.boundingBox.top < 0) {
      this.position.y = 0;
      this.velocity.y = -this.velocity.y * this.elasticity;
      collision = true;
    }

    // Check bottom boundary
    if (this.boundingBox.bottom > this.game.mapHeight) {
      this.position.y = this.game.mapHeight - this.boundingBox.size.y;
      this.velocity.y = -this.velocity.y * this.elasticity;
      collision = true;
    }

    if (collision) {
      this.boundingBox.updateX();
      this.boundingBox.updateY();
    }

    return collision;
  }

  /**
   * Handle collision with a rectangular block
   * @param {Object} block - Object with position (Vec2) and size (Vec2) properties
   * @returns {boolean} true if collision occurred and was handled
   */
  handleBlockCollision(block) {
    const centerX = this.position.x + this.radius;
    const centerY = this.position.y + this.radius;

    const closestX = Math.max(
      block.position.x,
      Math.min(centerX, block.position.x + block.size.x)
    );
    const closestY = Math.max(
      block.position.y,
      Math.min(centerY, block.position.y + block.size.y)
    );

    // Calculate distance between closest point and circle center
    const distance = Math.sqrt(
      Math.pow(centerX - closestX, 2) + Math.pow(centerY - closestY, 2)
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

      // Bounce off the wall - velocity dependent
      const normalX = pushX / pushLength;
      const normalY = pushY / pushLength;
      const dot = this.velocity.x * normalX + this.velocity.y * normalY;

      // Calculate bounce based on velocity magnitude
      const velocityMagnitude = Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
      );
      const bounceMultiplier = Math.max(velocityMagnitude, 2); // Minimum bounce for very slow movement

      this.velocity.x -= bounceMultiplier * dot * normalX * this.elasticity;
      this.velocity.y -= bounceMultiplier * dot * normalY * this.elasticity;

      return true;
    }

    return false;
  }

  /**
   * Handle collisions with tiles/blocks
   * @returns {boolean} true if collision occurred
   */
  handleTileCollisions() {
    const collidingTiles = this.tileMap.getCollidingTiles(
      "block",
      this.boundingBox
    );

    for (const tile of collidingTiles) {
      if (this.handleBlockCollision(tile)) {
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
    const dx =
      this.position.x + this.radius - (other.position.x + other.radius);
    const dy =
      this.position.y + this.radius - (other.position.y + other.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if circles are colliding
    if (distance < this.radius + other.radius) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate relative velocity
      const relativeVelocityX = this.velocity.x - other.velocity.x;
      const relativeVelocityY = this.velocity.y - other.velocity.y;
      // const relativeSpeed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

      // Calculate velocity along normal
      const velocityAlongNormal =
        relativeVelocityX * nx + relativeVelocityY * ny;

      // Only resolve if objects are moving towards each other
      if (velocityAlongNormal < 0) {
        // Calculate impulse scalar
        const impulseScalar = -1 * velocityAlongNormal;

        // Calculate impulse vector
        const impulseX = impulseScalar * nx;
        const impulseY = impulseScalar * ny;

        const thisBounce = new Vec2(
          impulseX * this.elasticity,
          impulseY * this.elasticity
        );

        const otherBounce = new Vec2(
          -impulseX * other.elasticity,
          -impulseY * other.elasticity
        );

        // Calculate aligned velocity components
        const alignedOtherX =
          this.velocity.x > 0
            ? Math.max(other.velocity.x, 0)
            : Math.min(other.velocity.x, 0);

        const alignedOtherY =
          this.velocity.y > 0
            ? Math.max(other.velocity.y, 0)
            : Math.min(other.velocity.y, 0);

        const alignedThisX =
          other.velocity.x > 0
            ? Math.max(this.velocity.x, 0)
            : Math.min(this.velocity.x, 0);

        const alignedThisY =
          other.velocity.y > 0
            ? Math.max(this.velocity.y, 0)
            : Math.min(this.velocity.y, 0);

        // Calculate new velocities using aligned components
        this.velocity.x = (thisBounce.x + alignedOtherX) / (this.mass / 10);
        this.velocity.y = (thisBounce.y + alignedOtherY) / (this.mass / 10);
        other.velocity.x = (otherBounce.x + alignedThisX) / (other.mass / 10);
        other.velocity.y = (otherBounce.y + alignedThisY) / (other.mass / 10);

        this.bounceForce = thisBounce;
        other.bounceForce = otherBounce;

        // Separate the objects to prevent sticking
        const overlap = this.radius + other.radius - distance;
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

        // Transfer speed between entities
        other.transferSpeed(this);
        this.transferSpeed(other);

        return true;
      }
    }
    return false;
  }

  transferSpeed(otherEntity) {
    // Clear any existing speed boost timer
    if (this.bumpBoostTimer) {
      clearTimeout(this.bumpBoostTimer);
    }

    // Set our max speed to match the other entity's current max speed
    this.maxSpeed = Math.max(otherEntity.maxSpeed, this.maxSpeed);

    // Set a timer to reset our speed after 1 second
    this.bumpBoostTimer = setTimeout(() => {
      this.maxSpeed = this.originalMaxSpeed;
      this.bumpBoostTimer = null;
    }, this.bumpBoostDuration);
  }

  getState() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.boundingBox.width,
      height: this.boundingBox.height,
      velocity: this.velocity,
      maxSpeed: this.maxSpeed,
    };
  }
}
