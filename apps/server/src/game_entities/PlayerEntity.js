import { PhysicsEntity } from "./PhysicsEntity.js";
import PowerupEntity from "./PowerupEntity.js";
import { Vec2 } from "../utils/vector.js";

export class PlayerEntity extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other
    // entities this distinction is moot
    super({
      ...config,
      type_of_actor: "active_dynamic",
      type: "player",
      size: new Vec2(config.radius * 2, config.radius * 2),
      mass: 10,
      elasticity: 0.5,
    });

    this.lives = 1; // Changed to 1 life for racing game

    // Racing game properties
    this.lastCheckpoint = null;
    this.finished = false;
    this.placement = null;
    this.startPosition = config.position.copy();

    // Movement forces
    this.normalMoveForce = 6;
    this.boostMoveForce = 12;
    this.currentMoveForce = this.normalMoveForce;

    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
    };
    this.disconnected = false;
    this.flags = {
      facing: "right", // Can be 'left' or 'right'
      about_to_boost: false,
      boosting: false,
    };
    this.socketId = config.socketId;

    this.powerup_time = 0;
    this.powerup_names = config.userData.powerups;
    this.powerups = [];
    for (const powerup_name of config.userData.powerups) {
      this.powerups.push(
        new PowerupEntity({
          id: this.game.generatePassiveActorId(),
          powerup_type: powerup_name,
          game: this.game,
          position: new Vec2(0, 0),
          tileMap: this.tileMap,
        })
      );
    }

    // Boost timers
    this.boostChargeStartTime = null;
    this.boostStartTime = null;
    this.boostReloadStartTime = 0;
    this.boostChargeDuration = 1000;
    this.boostDuration = 1000;
    this.boostReloadDuration = 10000;

    this.socket = config.socket;
  }

  /**
   * Update input state
   * @param {Object} newInput
   */
  updateInput(newInput) {
    this.input = { ...newInput };

    // Update facing direction based on input
    if (this.input.left) {
      this.flags.facing = "left";
    } else if (this.input.right) {
      this.flags.facing = "right";
    }

    // Handle boost input
    if (
      this.input.space &&
      !this.flags.about_to_boost &&
      !this.flags.boosting
    ) {
      this.startBoostCharge();
    }
  }

  startBoostCharge() {
    if (Date.now() - this.boostReloadStartTime >= this.boostReloadDuration) {
      this.flags.about_to_boost = true;
      this.boostChargeStartTime = Date.now();
      this.game.markActorChanged(this);
    }
  }

  updateBoostState() {
    const currentTime = Date.now();

    // Handle boost charge phase
    if (this.flags.about_to_boost) {
      // this.boostReloadStartTime += (Date.now() - this.boostReloadStartTime) / ((currentTime - this.boostChargeStartTime) / this.boostChargeDuration);
      this.boostReloadStartTime = currentTime;
      if (currentTime - this.boostChargeStartTime >= this.boostChargeDuration) {
        this.flags.about_to_boost = false;
        this.flags.boosting = true;
        this.boostStartTime = currentTime;
        this.game.markActorChanged(this);
      }

      this.updateClient(
        "boostReloadPercentage",
        Math.max(
          (360 *
            (this.boostChargeDuration -
              (currentTime - this.boostChargeStartTime) * 1)) /
            this.boostChargeDuration,
          0
        )
      );
    }
    // Handle boost phase
    else if (this.flags.boosting) {
      this.maxSpeed = this.boostMaxSpeed;
      this.currentMoveForce = this.boostMoveForce;
      if (currentTime - this.boostStartTime >= this.boostDuration) {
        this.endBoost();
      }
    } else {
      // emit back boost recharge state
      this.updateClient(
        "boostReloadPercentage",
        (Math.min(
          currentTime - this.boostReloadStartTime,
          this.boostReloadDuration
        ) /
          this.boostReloadDuration) *
          360
      );
    }
  }

  endBoost() {
    this.flags.boosting = false;
    this.maxSpeed = this.originalMaxSpeed;
    this.currentMoveForce = this.normalMoveForce;
    this.game.markActorChanged(this);
  }

  /**
   * Process inputs
   */
  handleInputs() {
    // Update boost state
    this.updateBoostState();

    if (this.input.left && this.velocity) {
      this.applyForce(new Vec2(-this.currentMoveForce, 0));
    } else if (this.input.right) {
      this.applyForce(new Vec2(this.currentMoveForce, 0));
    }

    if (this.input.up) {
      this.applyForce(new Vec2(0, -this.currentMoveForce));
    } else if (this.input.down) {
      this.applyForce(new Vec2(0, this.currentMoveForce));
    }

    // if 1/2/3/4/5/Z key is pressed, activate the corresponding powerup
    if (this.input.one && this.powerups.length > 0) {
      this.activatePowerup(0);
    } else if (this.input.two && this.powerups.length > 1) {
      this.activatePowerup(1);
    } else if (this.input.three && this.powerups.length > 2) {
      this.activatePowerup(2);
    } else if (this.input.four && this.powerups.length > 3) {
      this.activatePowerup(3);
    } else if (this.input.five && this.powerups.length > 4) {
      this.activatePowerup(4);
    }

    this.input = {};
  }

  activatePowerup(powerup_index) {
    this.powerups[powerup_index].activate(this);
    this.powerups.splice(powerup_index, 1);
    this.powerup_names.splice(powerup_index, 1);
    this.updateClient("powerups", this.powerup_names);
  }

  handlePlayerCollisions() {
    // Skip collision checks if this player has finished
    if (this.finished) return;

    // Check collisions with other players
    this.game.players.forEach(otherPlayer => {
      // Skip self or finished players
      if (otherPlayer.id === this.id || otherPlayer.finished) return;
      this.handleCircularCollision(otherPlayer);
    });
  }

  /**
   * Handle checkpoint and finish portal collisions
   */
  handleRacingCollisions() {
    // Check checkpoint collisions using actor lists for efficiency
    const checkpoints = this.game.actor_lists["checkpoint"];
    if (checkpoints) {
      checkpoints.forEach(checkpoint => {
        if (checkpoint.checkCollision(this)) {
          checkpoint.activateForPlayer(this.id);
          this.lastCheckpoint = checkpoint.position.copy();
          this.updateClient("lastCheckpoint", this.lastCheckpoint);
        }
      });
    }

    // Check finish portal collision using actor lists for efficiency
    const finishPortals = this.game.actor_lists["finish_portal"];
    if (finishPortals) {
      finishPortals.forEach(finishPortal => {
        if (finishPortal.checkCollision(this)) {
          const placement = finishPortal.finishPlayer(this.id);
          if (placement) {
            this.finished = true;
            this.placement = placement;
            this.updateClient("finished", true);
            this.updateClient("placement", placement);
          }
        }
      });
    }

    // Check lazer collisions using actor lists for efficiency
    const lazers = this.game.actor_lists["lazer"];
    if (lazers) {
      lazers.forEach(lazer => {
        if (lazer.checkCollision(this)) {
          this.loseLife();
        }
      });
    }
  }

  /**
   * Handle being sucked into the finish portal
   * @param {Vec2} portalPosition - Position of the finish portal
   */
  handlePortalSuction(portalPosition) {
    if (!this.finished) {
      // Reset suction flags if player is no longer finished
      this.flags.beingSuckedIn = false;
      this.flags.suctionScale = undefined;
      return;
    }

    // Calculate direction to portal
    const direction = portalPosition.subtract(this.position);
    const distance = direction.magnitude();

    // Apply strong suction force towards portal
    const suctionForce = 5;
    const normalizedDirection = direction.normalize();

    // Apply suction force using the proper physics method
    this.applyForce(normalizedDirection.scale(suctionForce));

    // Mark player as being sucked in for frontend scaling
    this.flags.beingSuckedIn = true;
    this.flags.portalScale = Math.min(distance / 50, 1);
  }

  /**
   * Respawn player at last checkpoint or start position
   */
  respawn() {
    if (this.lastCheckpoint) {
      this.position = this.lastCheckpoint.copy();
    } else {
      this.position = this.startPosition.copy();
    }
    this.velocity = new Vec2(0, 0);

    // Reset suction flags
    this.flags.beingSuckedIn = false;
    this.flags.suctionScale = undefined;

    this.game.markActorChanged(this);
  }

  /**
   * Lose a life and respawn
   */
  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.respawn();
      this.lives = 1; // Reset to 1 life after respawn
    }
    this.updateClient("lives", this.lives);
  }

  // updates the client in control of this specific player entity
  // used for sending back data that only the client in control needs
  updateClient(attributeName, attributeValue) {
    this.socket.emit("local-state-specific-data", {
      attributeName,
      attributeValue,
    });
  }

  /**
   * Update player state
   */
  update() {
    // If player has finished, handle portal suction instead of normal updates
    if (this.finished) {
      // Find the finish portal using actor lists for efficiency
      const finishPortals = this.game.actor_lists["finish_portal"];
      if (finishPortals && finishPortals.length > 0) {
        const finishPortal = finishPortals[0]; // Assuming there's only one finish portal
        this.handlePortalSuction(finishPortal.position);

        // process forces on player
        this.processForces();

        this.applyDrag();

        // Still update position for suction effect
        this.updateX();
        this.updateY();
      }
      return;
    }

    // handle inputs
    this.handleInputs();

    // process forces on player
    this.processForces();

    // Apply drag to slow down when no input
    if (
      !this.input.left &&
      !this.input.right &&
      !this.input.up &&
      !this.input.down
    ) {
      this.applyDrag();
    }

    // update position
    this.updateX();
    this.updateY();

    // Handle collisions with other players
    this.handlePlayerCollisions();

    // Handle collisions with tiles
    this.handleTileCollisions();

    // Handle collisions with map boundaries
    this.handleBoundaryCollisions();

    // Handle racing-specific collisions (checkpoints and finish portal)
    this.handleRacingCollisions();
  }

  getInitialState() {
    return {
      id: this.id,
      type: this.type,
      type_of_actor: this.type_of_actor,
      radius: this.radius,
      x: this.boundingBox.left,
      y: this.boundingBox.top,
      width: this.size.x,
      height: this.size.y,
      disconnected: this.disconnected,
      powerups: this.powerup_names,
      lives: this.lives,
      flags: {
        ...this.flags,
        finished: this.finished,
        placement: this.placement,
      },
    };
  }

  getUpdatedState() {
    return {
      id: this.id,
      x: this.boundingBox.left,
      y: this.boundingBox.top,
      disconnected: this.disconnected,
      powerups: this.powerup_names,
      flags: {
        ...this.flags,
        finished: this.finished,
        placement: this.placement,
      },
      lives: this.lives,
    };
  }
}
