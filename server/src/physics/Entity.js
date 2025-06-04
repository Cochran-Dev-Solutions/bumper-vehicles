import { Vec2 } from '../utils/vector.js';
import { BoundingBox } from '../utils/BoundingBox.js';

export class Entity {
  constructor(position, size) {
    this.position = position; // Vec2
    this.size = size; // Vec2
    this.boundingBox = new BoundingBox(position, size);
  }

  /**
   * Update the entity's state
   * Must be implemented by subclasses
   */
  update() {
    throw new Error('update() method must be implemented by subclass');
  }
} 