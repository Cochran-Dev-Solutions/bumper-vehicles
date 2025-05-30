export default class PhysicsEngine {
  constructor() {
    // Physics constants
    this.MAX_VELOCITY = 10;
    this.ACCELERATION = 0.2;
    this.DRAG_FORCE = 0.1;
    this.CANVAS_WIDTH = 800;
    this.CANVAS_HEIGHT = 600;
  }

  processPlayerMovement(player, input) {
    // Apply drag
    player.xVel *= (1 - this.DRAG_FORCE);
    player.yVel *= (1 - this.DRAG_FORCE);

    // Handle X movement
    if (input.left && Math.abs(player.xVel) < this.MAX_VELOCITY) {
      player.xAcc = -this.ACCELERATION;
      // Add extra drag when changing direction
      if (player.xVel > 0) {
        player.xAcc -= this.DRAG_FORCE / 2;
      }
    } else if (input.right && Math.abs(player.xVel) < this.MAX_VELOCITY) {
      player.xAcc = this.ACCELERATION;
      // Add extra drag when changing direction
      if (player.xVel < 0) {
        player.xAcc += this.DRAG_FORCE / 2;
      }
    } else if (Math.abs(player.xVel) > this.DRAG_FORCE) {
      // Apply drag when no input
      player.xAcc = player.xVel < 0 ? this.DRAG_FORCE : -this.DRAG_FORCE;
    } else {
      player.xVel = 0;
      player.xAcc = 0;
    }

    // Handle Y movement
    if (input.up && Math.abs(player.yVel) < this.MAX_VELOCITY) {
      player.yAcc = -this.ACCELERATION;
      if (player.yVel > 0) {
        player.yAcc -= this.DRAG_FORCE / 2;
      }
    } else if (input.down && Math.abs(player.yVel) < this.MAX_VELOCITY) {
      player.yAcc = this.ACCELERATION;
      if (player.yVel < 0) {
        player.yAcc += this.DRAG_FORCE / 2;
      }
    } else if (Math.abs(player.yVel) > this.DRAG_FORCE) {
      player.yAcc = player.yVel < 0 ? this.DRAG_FORCE : -this.DRAG_FORCE;
    } else {
      player.yVel = 0;
      player.yAcc = 0;
    }

    // Update velocity and position
    player.xVel += player.xAcc;
    player.yVel += player.yAcc;

    // Update position with boundary checking
    player.x = Math.max(0, Math.min(this.CANVAS_WIDTH - 30, player.x + player.xVel));
    player.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - 30, player.y + player.yVel));
  }

  createPlayer(id, x, y) {
    return {
      id,
      x,
      y,
      xVel: 0,
      yVel: 0,
      xAcc: 0,
      yAcc: 0,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      pendingInput: null
    };
  }
} 