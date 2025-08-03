import Camera from './Camera.js';

export default class MapCamera extends Camera {
  constructor(x, y, width, height, info) {
    super(x, y, width, height, info);
    this.p5Instance = null; // Store p5 instance for apply/restore methods
  }

  /**
   * Alternative constructor for MapScene compatibility
   * @param {p5} p - The p5 instance
   */
  static createForMapScene(p) {
    const cameraInfo = {
      xPos: 0,
      yPos: 0,
      width: p.width,
      height: p.height
    };
    const camera = new MapCamera(0, 0, p.width, p.height, cameraInfo);
    camera.setP5Instance(p);
    return camera;
  }
  
  /**
   * Tracks an object's position for map scenes
   * @param {Object} object - The object to track (should have x, y, width, height properties)
   */
  track(object) {
    // stationary camera: camera focuses on itself
    if (typeof object === "undefined") {
      object = this;
    }
    
    // calculate center of object
    const xPos = object.x + object.width / 2;
    const yPos = object.y + object.height / 2;
    
    // calculate angle between center of camera and center of object
    this.angle = Math.atan2(yPos - this.focusYPos, xPos - this.focusXPos);
    if (isNaN(this.angle)) {
      this.angle = 0;
      return;
    }
    
    // calculate 'update' vector to move camera
    this.distance = this.dist(this.focusXPos, this.focusYPos, xPos, yPos) * this.speed;
    this.focusXPos += this.distance * Math.cos(this.angle);
    this.focusYPos += this.distance * Math.sin(this.angle);
    
    // constrain camera by level boundaries
    this.focusXPos = this.constrain(this.focusXPos, this.info.xPos + this.halfWidth, this.info.width - this.halfWidth);
    this.focusYPos = this.constrain(this.focusYPos, this.info.yPos + this.halfHeight, this.info.height - this.halfHeight);
    
    // update camera coordinates
    this.x = -Math.round(this.halfWidth - this.focusXPos);
    this.y = -Math.round(this.halfHeight - this.focusYPos);
  }
  
  /**
   * Applies camera transformation to the p5.js context for map scenes
   * @param {p5} p - The p5 instance
   */
  view(p) {
    // translate based on camera's coordinates
    if (this.info.width >= this.width) {
      p.translate(-this.x, 0);
    } else {
      p.translate(0, 0);
    }

    if (this.info.height >= this.height) {
      p.translate(0, -this.y);
    } else {
      p.translate(0, 0);
    }
  }

  /**
   * Set the p5 instance for apply/restore methods
   * @param {p5} p - The p5 instance
   */
  setP5Instance(p) {
    this.p5Instance = p;
  }

  /**
   * Update method for map scene compatibility
   */
  update() {
    // This method is called by MapScene but doesn't need to do anything
    // as the tracking is handled by the track() method
  }

  /**
   * Apply camera transformation (alias for view)
   */
  apply() {
    if (this.p5Instance) {
      this.view(this.p5Instance);
    }
  }

  /**
   * Restore camera transformation
   */
  restore() {
    if (this.p5Instance) {
      // Restore by applying inverse transformation
      this.p5Instance.translate(this.x, this.y);
    }
  }

  /**
   * Zoom to a specific position and scale
   * @param {number} x - Target x position
   * @param {number} y - Target y position
   * @param {number} scale - Zoom scale
   */
  zoomTo(x, y, scale) {
    // Set camera focus to the target position
    this.focusXPos = x;
    this.focusYPos = y;
    
    // Update camera coordinates
    this.x = -Math.round(this.halfWidth - this.focusXPos);
    this.y = -Math.round(this.halfHeight - this.focusYPos);
    
    // Store zoom scale for future use
    this.zoomScale = scale;
  }

  /**
   * Reset camera to default state
   */
  reset() {
    // Reset focus to center
    this.focusXPos = this.halfWidth;
    this.focusYPos = this.halfHeight;
    
    // Reset camera coordinates
    this.x = 0;
    this.y = 0;
    
    // Clear zoom scale
    this.zoomScale = 1;
  }
} 