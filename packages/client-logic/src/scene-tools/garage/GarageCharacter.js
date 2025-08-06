import { AnimatedSprite } from "../../core/rendering/AnimatedSprite.js";

class GarageCharacter {
  constructor(p, x, y) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 200;

    // Animated sprite for Ari_Alligator
    this.sprite = null;
    this.loaded = false;

    this.scaleX = 1;
    this.time = 0;
  }

  async load(images = null) {
    // Use provided images or load them if not provided
    if (images) {
      this.sprite = new AnimatedSprite({ images });
      this.sprite.setAnimationSpeed(25);
      this.loaded = true;
    }
  }

  draw() {
    this.y += this.p.sin(this.time++ / 25) * 0.5;
    this.p.push();
    this.p.imageMode(this.p.CENTER);
    this.p.translate(this.x, this.y);
    this.p.scale(this.scaleX, 1);
    this.sprite.display(this.p, 0, 0, this.width, this.height);
    this.p.imageMode(this.p.CORNER);
    this.p.pop();
  }
}

export default GarageCharacter;
