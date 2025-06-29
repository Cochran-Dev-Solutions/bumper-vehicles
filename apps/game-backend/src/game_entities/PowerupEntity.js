import { PhysicsEntity } from "./PhysicsEntity.js";
import { Vec2 } from "../utils/vector.js";

export default class PowerupEntity extends PhysicsEntity {
  static powerupTypes = new Map([
    ["mine", {
      radius: 35,
      update: function () {
        this.game.players.forEach((player) => {
          const collided = this.handleCircularCollision(player);
          if (collided) {
            player.lives--;
            this.game.markActorChanged(this.player);
            this.remove();
          }
        });
      }
    }],
    ["missile", {
      size: new Vec2(75, 35),
      update: function () { }
    }],
    ["heart", {
      size: new Vec2(45, 45),
      lifespan: 2000,
      update: function () {
        if (Date.now() - this.activationTime >= this.life) {
          this.remove();
        }
      },
      activationFunction: function () {
        this.player.lives++;
        this.player.updateClient("lives", this.player.lives);
      }
    }]
  ]);

  constructor(config) {
    const powerupData = PowerupEntity.powerupTypes.get(config.powerup_type);

    super({
      ...config,
      type: "powerup",
      radius: powerupData.radius ? powerupData.radius : null,
      size: powerupData.size ? powerupData.size : new Vec2(powerupData.radius * 2, powerupData.radius * 2)
    });
    this.powerup_type = config.powerup_type;
    this.powerupData = powerupData;

    this.updatePowerup = function () {
      this.powerupData.update.call(this);
    };

    // the player who used the powerup
    this.player = null;

    this.activationTime = null;
    this.lifespan = powerupData.lifespan || null;
  }

  activate(player) {
    this.player = player;

    // update position & bounding box
    this.position = player.position.copy();

    this.flags = {
      facing: "right" // Can be 'left' or 'right'
    };

    this.game.passive_actors.push(this);
    this.game.physicsWorld.addEntity(this);
    this.game.markActorNew(this);

    // // register empty lsit
    this.actor_list = this.type + "-" + this.powerup_type;
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[this.actor_list].push(this);
    } else {
      this.game.actor_lists[this.actor_list] = [];
      this.game.actor_lists[this.actor_list].push(this);
    }

    if (this.powerupData.activationFunction) {
      this.powerupData.activationFunction.call(this);
    }

    this.activationTime = Date.now();
  }

  remove() {
    // (1) Add to removed_actors for the front-end
    this.game.markActorRemoved(this);

    // (2) Remove from actor_lists
    if (this.actor_list && this.game.actor_lists[this.actor_list]) {
      const idx = this.game.actor_lists[this.actor_list].indexOf(this);
      if (idx !== -1) {
        this.game.actor_lists[this.actor_list].splice(idx, 1);
      }
    }

    // (2) Remove from passive_actors
    if (Array.isArray(this.game.passive_actors)) {
      const idx = this.game.passive_actors.indexOf(this);
      if (idx !== -1) {
        this.game.passive_actors.splice(idx, 1);
      }
    }

    // (2) Remove from physics world
    if (this.game.physicsWorld && typeof this.game.physicsWorld.removeEntity === "function") {
      this.game.physicsWorld.removeEntity(this);
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
      this.flags.facing = "left";
    } else if (this.velocity.x < -0.1) {
      this.flags.facing = "right";
    }



    this.updatePowerup();
  }
} 