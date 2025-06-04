import { Vec2 } from './vector.js';

export class BoundingBox {
  constructor(position, size) {
    this.position = position; // Vec2
    this.size = size; // Vec2
  }

  updateX(newX) {
    this.position.x = newX;
  }

  updateY(newY) {
    this.position.y = newY;
  }

  updateSize(newSize) {
    this.size = newSize;
  }

  /**
   * Check if this bounding box intersects with another
   * @param {BoundingBox} other 
   * @returns {boolean}
   */
  intersects(other) {
    return (
      this.position.x < other.position.x + other.size.x &&
      this.position.x + this.size.x > other.position.x &&
      this.position.y < other.position.y + other.size.y &&
      this.position.y + this.size.y > other.position.y
    );
  }

  /**
   * Get the center point of the bounding box
   * @returns {Vec2}
   */
  getCenter() {
    return new Vec2(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2
    );
  }
} 