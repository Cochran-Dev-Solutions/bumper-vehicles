export default class Camera {
  constructor(x, y, width, height, info) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    
    this.info = info;
    
    // initialize camera focus at the center of the camera lens
    this.focusXPos = this.halfWidth;
    this.focusYPos = this.halfHeight;
    
    // update speed: adjust for smoothness
    this.speed = 0.158;
    this.angle = 0;
    this.distance = 0;
  }
  
  /**
   * Tracks an object's position - to be implemented by subclasses
   * @param {Object} object - The object to track
   */
  track(object) {
    throw new Error("track() method must be implemented by subclass");
  }
  
  /**
   * Applies camera transformation to the p5.js context - to be implemented by subclasses
   * @param {p5} p - The p5 instance
   */
  view(p) {
    throw new Error("view() method must be implemented by subclass");
  }
  
  /**
   * Calculate distance between two points
   * @param {number} x1 - First x coordinate
   * @param {number} y1 - First y coordinate
   * @param {number} x2 - Second x coordinate
   * @param {number} y2 - Second y coordinate
   * @returns {number} Distance between the points
   */
  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  
  /**
   * Constrain a value between a minimum and maximum
   * @param {number} value - The value to constrain
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Constrained value
   */
  constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Update camera dimensions (useful when canvas size changes)
   * @param {number} width - New width
   * @param {number} height - New height
   */
  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
  }
} 