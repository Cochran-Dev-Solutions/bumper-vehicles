import { StaticEntity } from './StaticEntity.js';
import { Vec2 } from '../utils/vector.js';

export class BlockEntity extends StaticEntity {
  static block_types = {
    'default': {
      on_collision: () => { }
    },
    'trampoline': {
      on_collision: (block, entity) => {
        // TODO: bounce entity off of block
      }
    }
  };

  constructor(config) {
    super({ ...config, type: 'block' });

    // check to make sure the block's position aligns with the tilemap grid
    if (!this.tileMap.isAlignedWithGrid(config.position.x, config.position.y)) {
      console.error(`Block position (${config.position.x}, ${config.position.y}) does not align with grid size ${this.tileMap.gridSize}`);
      throw new Error('Block position must align with grid');
    }

    // Add this block to the tile map
    this.tileMap.addEntity('block', this, config.position.x, config.position.y);
  }
} 