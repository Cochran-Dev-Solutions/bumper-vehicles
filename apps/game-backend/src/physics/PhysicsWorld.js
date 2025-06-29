import { TileMap } from "./TileMap.js";

export class PhysicsWorld {
  constructor() {
    this.entities = [];
    this.tileMap = new TileMap();
  }

  /**
   * Add an entity to the physics world
   * @param {Entity} entity 
   */
  addEntity(entity) {
    this.entities.push(entity);
  }

  /**
   * Remove an entity from the physics world
   * @param {Entity} entity 
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Update all entities in the physics world
   */
  update() {
    // Update all entities
    this.entities.forEach(entity => {
      const oldPosition = { x: entity.boundingBox.left, y: entity.boundingBox.top };
      const oldSize = { x: entity.size.x, y: entity.size.y };

      entity.update();

      // Check if position or size changed
      if ((oldPosition.x !== entity.boundingBox.left ||
        oldPosition.y !== entity.boundingBox.top ||
        oldSize.x !== entity.size.x ||
        oldSize.y !== entity.size.y)) {
        // Mark the entity as changed in its game
        entity.game.markActorChanged(entity);
      }
    });
  }
} 