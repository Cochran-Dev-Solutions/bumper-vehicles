import { loadImageAsync } from "../utils/images";

class GameActor {
  constructor(config) {
    this.p = config.p;
    this.x = config.x;
    this.y = config.y;
    this.id = config.id; // unique id for back-end syncing
    this.p = p; // p5 instance

    // display options:
    // 1) static image 
    // 2) animated sprite
    this.isAnimated = config.isAnimated || false;
    this.image = null;
    this.sprite = null;
    this.imageNames = [];
    this.spriteImages = [];

    // used for moving objects
    this.facingRight = true;
  }

  loadImages() {
    // load each image
    this.imageNames.forEach(async (imageName, i) => {
      const loadedImg = await loadImageAsync(this.p, imageName);
      if (i == 0) this.image = loadedImg;
      this.spriteImages.push(loadedImg);
    });
  }

  /**
   * Initialize the player's sprite with animation frames
   * @param {Array} images - Array of p5.Image objects for the animation
   */
  initSprite() {
    this.sprite = new AnimatedSprite({ images: this.spriteImages });
    this.sprite.setAnimationSpeed(8); // Default walking animation speed
  }

  /**
   * @param {p5.Image} image - p5.Image object for display
   */
  initImage(image) {
    this.image = image;
  }

  display() {
    if (this.isAnimated) {
      this.p.push();
      this.p.translate(this.x, this.y);

      // Flip horizontally if facing left
      if (!this.facingRight) {
        this.p.scale(-1, 1);
      }

      this.sprite.display(this.p, -15, -15, 30, 30);
      this.p.pop();
    } else {
      this.p.push();
      this.p.translate(this.x, this.y);

      // Flip horizontally if facing left
      if (!this.facingRight) {
        this.p.scale(-1, 1);
      }

      // TODO: display image
      this.p.pop();
    }
  }

  update() {
    throw new Error('Method update() must be implemented by subclass');
  }
}

export default GameActor;