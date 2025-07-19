import keyManager from "../EventObjects/KeyManager.js";
import { AnimatedSprite } from "../render-tools/AnimatedSprite.js";

class MapCharacter {
  constructor(p, islands, scene) {
    this.p = p;
    this.islands = islands;
    this.scene = scene;
    this.currentPosition = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.island = null;
    this.inputEnabled = true;
    this.movementSpeed = 0.1; // Fraction of distance to move per frame

    // Animated sprite for Ari_Alligator
    this.sprite = null;
    this.loaded = false;

    this.scaleX = 1;

    // Set initial position to first island
    if (this.islands && this.islands.length > 0) {
      this.island = this.islands[0];
      const stopPos = this.island.getStopPosition();
      this.currentPosition = { x: stopPos.x, y: stopPos.y };
      this.targetPosition = { x: stopPos.x, y: stopPos.y };
    }
  }

  async load() {
    // Load Ari_Alligator frames 1-15
    const p = this.p;
    const loadImageAsync = (src) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const p5Image = p.createImage(img.width, img.height);
          p5Image.drawingContext.drawImage(img, 0, 0);
          resolve(p5Image);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = "/Images/Ari_Alligator/frame_" + src + ".png";
      });
    };
    const promises = [];
    for (let i = 1; i <= 15; i++) {
      promises.push(loadImageAsync(i));
    }
    const images = await Promise.all(promises);
    this.sprite = new AnimatedSprite({ images });
    this.sprite.setAnimationSpeed(25);
    this.loaded = true;
  }

  update() {
    this.handleInput();
    this.updateMovement();
  }

  handleInput() {
    if (!this.inputEnabled) return;

    // Prevent movement if an island is selected and panel is open
    if (this.scene && this.scene.isZoomedIn && this.scene.selectedIsland) {
      return;
    }

    // Handle arrow key movement
    if (keyManager.pressed("right") && this.island.movement_actions.right) {
      this.moveToIsland(this.island.movement_actions.right);
    } else if (
      keyManager.pressed("left") &&
      this.island.movement_actions.left
    ) {
      this.moveToIsland(this.island.movement_actions.left);
    } else if (keyManager.pressed("up") && this.island.movement_actions.up) {
      this.moveToIsland(this.island.movement_actions.up);
    } else if (
      keyManager.pressed("down") &&
      this.island.movement_actions.down
    ) {
      this.moveToIsland(this.island.movement_actions.down);
    }

    // Handle enter key to select current island
    if (keyManager.pressed("enter")) {
      if (this.scene && this.scene.selectIsland) {
        this.scene.selectIsland(this.island);
      }
      keyManager.keyReleased("enter");
    }
  }

  moveToIsland(targetIsland) {
    if (!targetIsland) return;

    const stopPos = targetIsland.getStopPosition();
    this.targetPosition = { x: stopPos.x, y: stopPos.y };

    this.scaleX = (this.targetPosition.x > this.currentPosition.x) ? 1 : -1;

    this.inputEnabled = false;
  }

  updateMovement() {
    // Calculate distance to target
    const dx = this.targetPosition.x - this.currentPosition.x;
    const dy = this.targetPosition.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.inputEnabled = true;
      // Find which island we're now at
      for (const island of this.islands) {
        const stopPos = island.getStopPosition();
        if (
          Math.abs(stopPos.x - this.currentPosition.x) < 5 &&
          Math.abs(stopPos.y - this.currentPosition.y) < 5
        ) {
          this.island = island;
          break;
        }
      }
    }

    if (distance > 2) {
      // Move towards target
      this.currentPosition.x += dx * this.movementSpeed;
      this.currentPosition.y += dy * this.movementSpeed;
    } else {
      // Arrived at target
      this.currentPosition.x = this.targetPosition.x;
      this.currentPosition.y = this.targetPosition.y;
    }
  }

  draw() {
    if (!this.loaded || !this.sprite) {
      // Fallback: draw a simple circle
      this.p.fill(255, 0, 0);
      this.p.noStroke();
      this.p.ellipse(this.currentPosition.x, this.currentPosition.y, 20, 20);
    } else {
      // Draw the animated Ari_Alligator sprite
      this.p.push();
      this.p.imageMode(this.p.CENTER);
      this.p.translate(this.currentPosition.x, this.currentPosition.y);
      this.p.scale(this.scaleX, 1);
      this.sprite.display(
        this.p,
        0,
        0,
        40,
        40
      );
      this.p.imageMode(this.p.CORNER);
      this.p.pop();
    }
  }
}

export default MapCharacter;
