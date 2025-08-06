import { Vec2 } from "../utils/vector.js";

export class BoundingBox {
  constructor(entity) {
    this.entity = entity;
    
    // If size is not defined but radius is, derive size from radius
    if (!entity.size && entity.radius) {
      this.size = new Vec2(entity.radius * 2, entity.radius * 2);
    } else {
      this.size = entity.size || new Vec2(0, 0);
    }
    
    this.left = entity.position.x;
    this.right = entity.position.x + this.size.x;
    this.top = entity.position.y;
    this.bottom = entity.position.y + this.size.y;
  }

  updateX() {
    this.left = this.entity.position.x;
    this.right = this.entity.position.x + this.size.x;
  }

  updateY() {
    this.top = this.entity.position.y;
    this.bottom = this.entity.position.y + this.size.y;
  }

  updateSize() {
    // Re-derive size from radius if needed
    if (!this.entity.size && this.entity.radius) {
      this.size = new Vec2(this.entity.radius * 2, this.entity.radius * 2);
    } else {
      this.size = this.entity.size || new Vec2(0, 0);
    }
    this.right = this.left + this.size.x;
    this.bottom = this.top + this.size.y;
  }

  /**
   * Check if this bounding box intersects with another
   * @param {BoundingBox} other 
   * @returns {boolean}
   */
  intersects(other) {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  /**
   * Get the center point of the bounding box
   * @returns {Vec2}
   */
  getCenter() {
    return new Vec2(
      this.left + this.size.x / 2,
      this.top + this.size.y / 2
    );
  }
} 