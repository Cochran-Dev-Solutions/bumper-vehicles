import { loadImageAsync } from "../utils/images";
import { AnimatedSprite } from "../utils/AnimatedSprite";

class GameActor {
  constructor(config) {
    this.p = config.p;
    this.x = config.x;
    this.y = config.y;
    this.id = config.id; // unique id for back-end syncing
    this.p = config.p; // p5 instance

    // for players
    this.disconnected = false;

    // display options:
    // 1) static image 
    // 2) animated sprite
    this.isAnimated = config.isAnimated || false;
    this.image = null;
    this.sprite = null;
    this.imageNames = [];
    this.spriteImages = [];

    // Initialize flags from server or default
    this.flags = config.flags || {
      facing: 'right'
    };
  }

  async loadImages() {
    // Create an array of promises for each image
    const imagePromises = this.imageNames.map(async (imageName, i) => {
      const loadedImg = await loadImageAsync(this.p, imageName);
      this.spriteImages.push(loadedImg);
    });

    // Wait for all images to load
    await Promise.all(imagePromises);

    if (this.isAnimated) {
      this.initSprite();
    } else {
      this.image = this.spriteImages[0];
    }
  }

  /**
   * Initialize the player's sprite with animation frames
   * @param {Array} images - Array of p5.Image objects for the animation
   */
  initSprite() {
    this.sprite = new AnimatedSprite({ images: this.spriteImages });
    this.sprite.setAnimationSpeed(8); // Default walking animation speed
  }

  display() {
    if (this.isAnimated) {
      this.p.push();
      this.p.translate(this.x, this.y);

      // Flip horizontally if facing left
      if (this.flags.facing === 'left') {
        this.p.scale(-1, 1);
      }

      // Add blinking effect if disconnected
      if (this.disconnected) {
        const alpha = this.p.sin(this.p.frameCount * 0.1) * 127 + 128; // Oscillate between 128 and 255
        this.p.tint(255, alpha);
      }

      this.sprite.display(this.p, -15, -15, 30, 30);
      this.p.pop();
    } else {
      this.p.push();
      this.p.translate(this.x, this.y);

      // Flip horizontally if facing left
      if (this.flags.facing === 'left') {
        this.p.scale(-1, 1);
      }

      // Add blinking effect if disconnected
      if (this.disconnected) {
        const alpha = this.p.sin(this.p.frameCount * 0.1) * 127 + 128; // Oscillate between 128 and 255
        this.p.tint(255, alpha);
      }

      // TODO: display image
      this.p.pop();
    }
  }

  updateState(newState) {
    const { id, ...stateToUpdate } = newState;
    Object.assign(this, stateToUpdate);
  }

  update() {
    throw new Error('Method update() must be implemented by subclass');
  }
}

export default GameActor;