import DynamicActor from './DynamicActor.js';

export class BouncyBallActor extends DynamicActor {
  constructor(config) {
    super(config);
    // this.imageNames.push('Misc/bouncy_ball.png'); // Add bouncy ball image to load
  }

  update() {
    this.display();
  }
} 