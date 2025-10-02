import { AnimatedSprite } from "../rendering/AnimatedSprite.js";

export default class GameActor {
  constructor(config) {
    this.p = config.p;
    this.game = config.game;
    this.id = config.id;
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.isAnimated = config.isAnimated || false;
    this.images = [];
    this.imageNames = [];
    this.currentImageIndex = 0;
    this.animationSpeed = 0.1;
    this.animationCounter = 0;
    this.flags = config.flags || {};

    // Rotation variables
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.opacity = 1;

    // for players
    this.disconnected = false;

    // display options:
    // 1) static image
    // 2) animated sprite
    this.image = null;
    this.sprite = null;
    this.spriteImages = [];
  }

  async loadImages(animationSpeed) {
    // Load all images in order and assign directly to spriteImages
    this.spriteImages = await Promise.all(
      this.imageNames.map(imageName => this.game.loadImage(imageName))
    );

    if (this.isAnimated) {
      this.initSprite(animationSpeed);
    } else {
      this.image = this.spriteImages[0];
    }
  }

  /**
   * Initialize the player's sprite with animation frames
   * @param {Array} images - Array of p5.Image objects for the animation
   */
  initSprite(speed = 8) {
    this.sprite = new AnimatedSprite({ images: this.spriteImages });
    this.sprite.setAnimationSpeed(speed); // Default walking animation speed
  }

  display() {
    if (this.isAnimated && this.sprite) {
      this.p.push();
      this.p.translate(this.x + this.imageWidth / 2, this.y + this.imageHeight / 2);
      this.p.rotate(this.rotation);
      this.p.scale(this.scaleX, this.scaleY);
      if (this.opacity < 1) {
        this.p.tint(255, this.opacity * 255);
      }

      if (this.type === "player") {
        console.log("imageWidth: ", this.imageWidth);
      }

      this.sprite.display(
        this.p,
        -this.imageWidth / 2,
        -this.imageHeight / 2,
        this.imageWidth,
        this.imageHeight
      );
      this.p.pop();
    } else {
      this.p.push();
      this.p.translate(this.x + this.width / 2, this.y + this.height / 2);
      this.p.rotate(this.rotation);
      this.p.scale(this.scaleX, this.scaleY);
      if (this.opacity < 1) {
        this.p.tint(255, this.opacity * 255);
      }

      // Display the image if it exists, otherwise show a fallback shape
      if (this.image) {
        this.p.image(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else {
        // Fallback to a colored rectangle
        this.p.fill(100);
        this.p.rect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
      this.p.pop();
    }
  }

  updateState(newState) {
    Object.assign(this, newState);
  }

  removeFromGame() {
    // Remove from id_actor_map
    this.game.id_actor_map.delete(this.id);

    // Remove from actors array
    const idx = this.game.actors.indexOf(this);
    if (idx !== -1) {
      this.game.actors.splice(idx, 1);
    }
  }

  update() {
    throw new Error("Method update() must be implemented by subclass");
  }
}
