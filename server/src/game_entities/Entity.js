import { Vec2 } from '../utils/vector.js';
import { BoundingBox } from '../physics/BoundingBox.js';

export class Entity {
  constructor(config) {
    this.position = config.position; // Vec2
    this.size = config.size; // Vec2
    this.radius = config.radius || null;
    this.boundingBox = new BoundingBox(this);
    this.game = config.game;
    this.tileMap = config.tileMap;
    this.type = config.type;
    this.id = config.id;
    this.hasUpdate = config.hasUpdate !== undefined ? config.hasUpdate : true;
    this.type_of_actor = config.type_of_actor || 'passive_static'; // Default to passive_static
  }

  /**
   * Update the entity's state
   * Must be implemented by subclasses
   */
  update() {
    throw new Error('update() method must be implemented by subclass');
  }
} 