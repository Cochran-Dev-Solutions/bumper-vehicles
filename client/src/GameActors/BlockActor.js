import StaticActor from './StaticActor.js';

export class BlockActor extends StaticActor {
  constructor(config) {
    super(config);
    this.imageNames.push('Block/block.png'); // Add block image to load
  }
} 