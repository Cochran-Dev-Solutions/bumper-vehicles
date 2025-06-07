import StaticActor from './StaticActor.js';

export class BlockActor extends StaticActor {
  constructor(config) {
    super(config);
    this.imageNames.push('Block/block.png'); // Add block image to load
  }

  update() {
    this.display();
  }

  display() {
    if (this.image) {
      this.p.image(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback to rectangle if image not loaded
      this.p.fill(100);
      this.p.rect(this.x, this.y, this.width, this.height);
    }
  }
} 