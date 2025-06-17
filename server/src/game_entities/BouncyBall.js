import { PhysicsEntity } from './PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export class BouncyBall extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other 
    // entities this distinction is moot
    super({
      ...config,
      size: new Vec2(config.radius * 2, config.radius * 2),
      type: 'bouncy_ball',
      mass: 5,
      elasticity: 1
    });

    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };

    // register empty lsit
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[this.type].push(this);
    } else {
      this.game.actor_lists[this.type] = [];
      this.game.actor_lists[this.type].push(this);
    }
  }

  handlePlayerCollision(player) {
    return this.handleCircularCollision(player);
  }

  handleBouncyBallCollisions() {
    // Get all bouncy balls from the actor list
    const bouncyBalls = this.game.actor_lists['bouncy_ball'] || [];

    // Check collisions with other bouncy balls
    bouncyBalls.forEach((otherBall) => {
      // Skip self
      if (otherBall.id === this.id) return;
      this.handleCircularCollision(otherBall);
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

  getInitialState() {
    return {
      id: this.id,
      type: this.type,
      type_of_actor: this.type_of_actor,
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y,
      flags: this.flags
    };
  }

  getUpdatedState() {
    return {
      id: this.id,
      x: this.position.x,
      y: this.position.y,
      flags: this.flags
    };
  }
} 