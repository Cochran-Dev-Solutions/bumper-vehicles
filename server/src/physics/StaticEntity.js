import { Entity } from './Entity.js';

export class StaticEntity extends Entity {
  constructor(position, size) {
    super(position, size);
  }

  /**
   * Update the static entity's state
   * Must be implemented by subclasses
   */
  update() {
    throw new Error('update() method must be implemented by subclass');
  }
} 