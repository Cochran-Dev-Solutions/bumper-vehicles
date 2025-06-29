import { BoundingBox } from "../physics/BoundingBox.js";

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
    this.type_of_actor = config.type_of_actor || "passive_static"; // Default to passive_static
  }

  /**
   * Update the entity's state
   * Must be implemented by subclasses
   */
  update() {
    throw new Error("update() method must be implemented by subclass");
  }

  /**
   * Get the initial state of the entity when it's first created
   * Must be implemented by subclasses
   */
  getInitialState() {
    throw new Error("getInitialState() method must be implemented by subclass");
  }

  /**
   * Get the updated state of the entity when it changes
   * Must be implemented by subclasses
   */
  getUpdatedState() {
    throw new Error("getUpdatedState() method must be implemented by subclass");
  }
} 