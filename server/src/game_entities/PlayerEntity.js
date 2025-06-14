import { PhysicsEntity } from './PhysicsEntity.js';
import PowerupEntity from './PowerupEntity.js';
import { Vec2 } from '../utils/vector.js';

export class PlayerEntity extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other 
    // entities this distinction is moot
    super({
      ...config,
      size: new Vec2(config.radius * 2, config.radius * 2),
      mass: 10,
      elasticity: 0.5
    });
    this.moveForce = 6;

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


    this.powerups = [];
    for (const powerup_name of config.userData.powerups) {
      this.powerups.push(new PowerupEntity({
        type: powerup_name,
        game: this.game,
        position: new Vec2(0, 0),
        size: new Vec2(25, 25),
        tileMap: this.tileMap
      }));
    }
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
    if (this.input.left && this.velocity) {
      this.applyForce(new Vec2(-this.moveForce, 0));
    } else if (this.input.right) {
      this.applyForce(new Vec2(this.moveForce, 0));
    }

    if (this.input.up) {
      this.applyForce(new Vec2(0, -this.moveForce));
    } else if (this.input.down) {
      this.applyForce(new Vec2(0, this.moveForce));
    }

    // if 1/2/3/4/5/Z key is pressed, activate the corresponding powerup
    if (this.input.powerup1) {
      this.activatePowerup(0);
    } else if (this.input.powerup2) {
      this.activatePowerup(1);
    } else if (this.input.powerup3) {
      this.activatePowerup(2);
    } else if (this.input.powerup4) {
      this.activatePowerup(3);
    } else if (this.input.powerup5) {
      this.activatePowerup(4);
    } else if (this.input.powerupZ) {
      this.activatePowerup(5);  // Add Z key powerup activation
    }
  }

  activatePowerup(powerup_index) {
    this.powerups[powerup_index].activate(this.position);
  }

  handlePlayerCollisions() {
    // Check collisions with other players
    this.game.players.forEach((otherPlayer) => {
      // Skip self
      if (otherPlayer.id === this.id) return;
      this.handleCircularCollision(otherPlayer);
    });
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
      this.applyDrag();
    }

    // update X and check for collisions along the x-axis
    this.updateX();
    this.updateY();

    // Handle collisions with other players
    this.handlePlayerCollisions();

    // Handle collisions with tiles
    this.handleTileCollisions();
  }
} 