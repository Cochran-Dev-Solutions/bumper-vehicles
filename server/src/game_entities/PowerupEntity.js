import { PhysicsEntity } from './PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export default class PowerUpEntity extends PhysicsEntity {
  constructor(config) {
    super({ ...config, type: 'powerup' });

    this.powerup_type = config.powerup_type;
  }

  activate(position) {
    // update position & bounding box
    this.position = position.copy();

    this.size = new Vec2(25, 25);


    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };

    this.game.passive_actors.push(this);
    this.game.physicsWorld.addEntity(this);
    this.game.markActorNew(this);

    // // register empty lsit
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[this.type].push(this);
    } else {
      this.game.actor_lists[this.type] = [];
      this.game.actor_lists[this.type].push(this);
    }
  }

  getState() {
    return {
      id: this.id,
      type: this.type,
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y,
      powerup_type: this.powerup_type
    };
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
    this.boundingBox.updateX();

    // update Y
    this.updateY();
    this.boundingBox.updateY();

    // update state
    if (this.velocity.x > 0.1) {
      this.flags.facing = 'left';
    } else if (this.velocity.x < -0.1) {
      this.flags.facing = 'right';
    }

    // TODO: handle collisions
  }
} 