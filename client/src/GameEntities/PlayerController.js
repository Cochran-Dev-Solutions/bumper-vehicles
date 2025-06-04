import { AnimatedSprite } from '../sprites/AnimatedSprite.js';
import keyManager from '../EventObjects/KeyManager.js';
import socket from '../socket.js';

export class PlayerController {
  constructor(p, x, y, playerId) {
    this.playerId = playerId;
    this.p = p; // p5 instance
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.facingRight = true; // true for right, false for left
    this.lastInputUpdate = 0;
    this.inputUpdateInterval = 1000 / 60; // 60fps
  }

  /**
   * Initialize the player's sprite with animation frames
   * @param {Array} images - Array of p5.Image objects for the animation
   */
  initSprite(images) {
    this.sprite = new AnimatedSprite({ images });
    this.sprite.setAnimationSpeed(8); // Default walking animation speed
  }

  /**
   * Update the player's input state
   */
  updateInputs() {
    this.inputs = {
      up: keyManager.pressed('up'),
      down: keyManager.pressed('down'),
      left: keyManager.pressed('left'),
      right: keyManager.pressed('right')
    };

    // Update facing direction based on left/right input
    if (this.inputs.left) {
      this.facingRight = false;
    } else if (this.inputs.right) {
      this.facingRight = true;
    }

    this.sendInputs();
  }

  /**
   * Send current input state to the server
   */
  sendInputs() {
    const currentTime = Date.now();
    if (socket.id && currentTime - this.lastInputUpdate >= this.inputUpdateInterval) {
      socket.emit('playerInput', {
        playerId: this.playerId,
        input: this.inputs
      });
      this.lastInputUpdate = currentTime;
    }
  }

  /**
   * Display the player's sprite at the current position
   */
  display() {
    if (this.sprite) {
      this.p.push();
      this.p.translate(this.x, this.y);

      // Flip horizontally if facing left
      if (!this.facingRight) {
        this.p.scale(-1, 1);
      }

      this.sprite.display(this.p, -15, -15, 30, 30);
      this.p.pop();
    }
  }

  /**
   * Smooth physics interpolation
   * This method can be implemented to handle client-side prediction and interpolation
   * between server updates. It would:
   * 1. Predict the player's position based on current velocity and inputs
   * 2. Interpolate between the last known server position and the predicted position
   * 3. Smoothly correct the position when new server data arrives
   * 
   * This helps reduce perceived lag and makes movement feel more responsive
   * while maintaining server authority over the actual game state.
   */
  smoothPhysics() {
    // TODO: Implement client-side prediction and interpolation
    // This would involve:
    // - Storing previous positions and velocities
    // - Calculating predicted positions based on current inputs
    // - Smoothly interpolating between server updates
    // - Handling reconciliation when server corrections arrive
  }
} 