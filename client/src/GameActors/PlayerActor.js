import keyManager from '../EventObjects/KeyManager.js';
import socket from '../networking/socket.js';
import DynamicActor from './DynamicActor.js';

export class PlayerActor extends DynamicActor {
  constructor(config) {
    super({ ...config, isAnimated: true });

    // names of images we want to load for our player
    this.imageNames.push(
      'Penguin/penguin_walk01.png',
      'Penguin/penguin_walk02.png',
      'Penguin/penguin_walk03.png',
      'Penguin/penguin_walk04.png'
    );

    this.isLocalPlayer = config.isLocalPlayer;
    this.socket_id = config.socket_id || null;

    // if isLocalPlayer is true, then we will use these
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.lastInputUpdate = 0;
    this.inputUpdateInterval = 1000 / 60; // 60fps
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
        playerId: this.id,
        input: this.inputs
      });
      this.lastInputUpdate = currentTime;
    }
  }

  update() {
    if (this.isLocalPlayer) {
      this.updateInputs();
      this.sendInputs();
    }

    this.display();
  }
} 