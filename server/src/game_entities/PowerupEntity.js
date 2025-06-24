import { PhysicsEntity } from './PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export default class PowerupEntity extends PhysicsEntity {
  static powerupTypes = new Map([
    ['mine', {
      size: new Vec2(75, 75),
      update: function () { }
    }],
    ['missile', {
      size: new Vec2(75, 35),
      update: function () { }
    }],
    ['heart', {
      size: new Vec2(45, 45),
      update: function () {
        // set powerup to be removed after a specific amount of time
        // send 'removed_actors' to front-end to remove unecessary actors
        // remove entity from all data structures on back-end
      },
      activationFunction: function () {
        this.usedByPlayer.lives++;
      }
    }]
  ]);

  constructor(config) {
    super({ ...config, type: 'powerup', size: PowerupEntity.powerupTypes.get(config.powerup_type).size });
    this.powerup_type = config.powerup_type;
    this.powerupData = PowerupEntity.powerupTypes.get(config.powerup_type);
    // the player who used the powerup
    this.usedByPlayer = null;
  }

  activate(player) {
    this.usedByPlayer = player;

    // update position & bounding box
    this.position = player.position.copy();

    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };

    this.game.passive_actors.push(this);
    this.game.physicsWorld.addEntity(this);
    this.game.markActorNew(this);

    // // register empty lsit
    const actor_list = this.type + '-' + this.powerup_type;
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[actor_list].push(this);
    } else {
      this.game.actor_lists[actor_list] = [];
      this.game.actor_lists[actor_list].push(this);
    }

    if (this.powerupData.activationFunction) {
      this.powerupData.activationFunction.call(this);
    }
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
      powerup_type: this.powerup_type
    };
  }

  getUpdatedState() {
    return {
      id: this.id,
      x: this.position.x,
      y: this.position.y,
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