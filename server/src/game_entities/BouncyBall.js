import { PhysicsEntity } from './PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export class BouncyBall extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other 
    // entities this distinction is moot
    super({ ...config, size: new Vec2(config.radius * 2, config.radius * 2), type: 'bouncy_ball' });
    this.dragCoefficient = 0.2; // Higher drag for more responsive movement

    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };
    this.radius = config.radius;
    this.elasticity = 0.8; // How bouncy the ball is (0-1)

    // register empty lsit
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[this.type].push(this);
    } else {
      this.game.actor_lists[this.type] = [];
      this.game.actor_lists[this.type].push(this);
    }

  }

  handlePlayerCollision(player) {
    // Calculate distance between centers
    const dx = (this.position.x + this.radius) - (player.position.x + player.radius);
    const dy = (this.position.y + this.radius) - (player.position.y + player.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if circles are colliding
    if (distance < (this.radius + player.radius)) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate relative velocity
      const relativeVelocityX = this.velocity.x - player.velocity.x;
      const relativeVelocityY = this.velocity.y - player.velocity.y;
      const relativeSpeed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

      // Calculate velocity along normal
      const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

      // Only resolve if objects are moving towards each other
      if (velocityAlongNormal < 0) {
        // Calculate impulse scalar
        const impulseScalar = -(1 + this.elasticity) * velocityAlongNormal;

        // Calculate mass ratio (assuming equal mass for simplicity)
        const massRatio = 0.5;

        // Calculate impulse vector
        const impulseX = impulseScalar * nx * massRatio;
        const impulseY = impulseScalar * ny * massRatio;

        // Apply impulse to both objects
        this.velocity.x += impulseX;
        this.velocity.y += impulseY;
        player.velocity.x -= impulseX;
        player.velocity.y -= impulseY;

        // Separate the objects to prevent sticking
        const overlap = (this.radius + player.radius) - distance;
        const separationX = nx * overlap * 0.5;
        const separationY = ny * overlap * 0.5;

        this.position.x += separationX;
        this.position.y += separationY;
        player.position.x -= separationX;
        player.position.y -= separationY;

        // Update bounding boxes
        this.boundingBox.updateX();
        this.boundingBox.updateY();
        player.boundingBox.updateX();
        player.boundingBox.updateY();

        return true;
      }
    }
    return false;
  }

  /* 
    * Handle Collisions with Blocks
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
        this.velocity.x -= 2 * dot * normalX * this.elasticity;
        this.velocity.y -= 2 * dot * normalY * this.elasticity;

        return true;
      }
    }

    return false;
  }

  handleBouncyBallCollisions() {
    // Get all bouncy balls from the actor list
    const bouncyBalls = this.game.actor_lists['bouncy_ball'] || [];

    // Check collisions with other bouncy balls
    bouncyBalls.forEach((otherBall) => {
      // Skip self
      if (otherBall.id === this.id) return;

      // Calculate distance between centers
      const dx = (this.position.x + this.radius) - (otherBall.position.x + otherBall.radius);
      const dy = (this.position.y + this.radius) - (otherBall.position.y + otherBall.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if circles are colliding
      if (distance < (this.radius + otherBall.radius)) {
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate relative velocity
        const relativeVelocityX = this.velocity.x - otherBall.velocity.x;
        const relativeVelocityY = this.velocity.y - otherBall.velocity.y;
        const relativeSpeed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

        // Calculate velocity along normal
        const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

        // Only resolve if objects are moving towards each other
        if (velocityAlongNormal < 0) {
          // Calculate impulse scalar
          const impulseScalar = -(1 + this.elasticity) * velocityAlongNormal;

          // Calculate mass ratio (assuming equal mass for simplicity)
          const massRatio = 0.5;

          // Calculate impulse vector
          const impulseX = impulseScalar * nx * massRatio;
          const impulseY = impulseScalar * ny * massRatio;

          // Apply impulse to both objects
          this.velocity.x += impulseX;
          this.velocity.y += impulseY;
          otherBall.velocity.x -= impulseX;
          otherBall.velocity.y -= impulseY;

          // Separate the objects to prevent sticking
          const overlap = (this.radius + otherBall.radius) - distance;
          const separationX = nx * overlap * 0.5;
          const separationY = ny * overlap * 0.5;

          this.position.x += separationX;
          this.position.y += separationY;
          otherBall.position.x -= separationX;
          otherBall.position.y -= separationY;

          // Update bounding boxes
          this.boundingBox.updateX();
          this.boundingBox.updateY();
          otherBall.boundingBox.updateX();
          otherBall.boundingBox.updateY();
        }
      }
    });
  }

  /**
   * Update state
   */
  update() {
    // process forces on player
    this.processForces();
    this.applyDrag(this.dragCoefficient);

    // update X and check for collisions along the x-axis
    this.updateX();
    this.updateY();

    // update state
    if (this.velocity.x > 0.1) {
      this.flags.facing = 'left';
    } else if (this.velocity.x < -0.1) {
      this.flags.facing = 'right';
    }

    // Handle collisions with other bouncy balls
    this.handleBouncyBallCollisions();

    // Handle collisions with players
    this.game.players.forEach((player) => {
      this.handlePlayerCollision(player);
    });

    this.handleTileCollisions();
  }
} 