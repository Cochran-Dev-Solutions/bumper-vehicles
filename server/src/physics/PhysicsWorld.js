export class PhysicsWorld {
  constructor() {
    this.entities = [];
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
    for (const entity of this.entities) {
      entity.update();
    }
  }
} 