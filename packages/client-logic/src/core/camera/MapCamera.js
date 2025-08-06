import Camera from "./Camera.js";

export default class MapCamera extends Camera {
  constructor(x, y, width, height, info) {
    super(x, y, width, height, info);
    this.p5Instance = null; // Store p5 instance for apply/restore methods
    this.zoomScale = 1; // Initialize zoom scale
    this.targetZoomScale = 1; // Target zoom scale for smooth interpolation
    this.zoomSpeed = 0.1; // Interpolation speed (0-1)

    // Position interpolation properties
    this.targetX = 0; // Target x position for smooth interpolation
    this.targetY = 0; // Target y position for smooth interpolation
    this.positionSpeed = 0.1; // Position interpolation speed (0-1)
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
      height: p.height,
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
    this.distance =
      this.dist(this.focusXPos, this.focusYPos, xPos, yPos) * this.speed;
    this.focusXPos += this.distance * Math.cos(this.angle);
    this.focusYPos += this.distance * Math.sin(this.angle);

    // constrain camera by level boundaries
    this.focusXPos = this.constrain(
      this.focusXPos,
      this.info.xPos + this.halfWidth,
      this.info.width - this.halfWidth
    );
    this.focusYPos = this.constrain(
      this.focusYPos,
      this.info.yPos + this.halfHeight,
      this.info.height - this.halfHeight
    );

    // update camera coordinates
    this.x = -Math.round(this.halfWidth - this.focusXPos);
    this.y = -Math.round(this.halfHeight - this.focusYPos);
  }

  /**
   * Applies camera transformation to the p5.js context for map scenes
   * @param {p5} p - The p5 instance
   */
  view(p) {
    p.push();

    // Apply zoom scale if set
    if (this.zoomScale && this.zoomScale !== 1) {
      p.translate(this.halfWidth, this.halfHeight);
      p.scale(this.zoomScale);
      p.translate(-this.halfWidth, -this.halfHeight);
    }

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
    // Smoothly interpolate zoom scale towards target
    if (this.zoomScale !== this.targetZoomScale) {
      this.zoomScale +=
        (this.targetZoomScale - this.zoomScale) * this.zoomSpeed;

      // Snap to target when very close to avoid floating point issues
      if (Math.abs(this.zoomScale - this.targetZoomScale) < 0.01) {
        this.zoomScale = this.targetZoomScale;
      }
    }

    // Smoothly interpolate position towards target
    if (this.x !== this.targetX) {
      this.x += (this.targetX - this.x) * this.positionSpeed;

      // Snap to target when very close to avoid floating point issues
      if (Math.abs(this.x - this.targetX) < 0.1) {
        this.x = this.targetX;
      }
    }

    if (this.y !== this.targetY) {
      this.y += (this.targetY - this.y) * this.positionSpeed;

      // Snap to target when very close to avoid floating point issues
      if (Math.abs(this.y - this.targetY) < 0.1) {
        this.y = this.targetY;
      }
    }
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
      this.p5Instance.pop();
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

    // Set target camera coordinates for smooth interpolation
    this.targetX = -Math.round(this.halfWidth - this.focusXPos);
    this.targetY = -Math.round(this.halfHeight - this.focusYPos);

    // Set target zoom scale for smooth interpolation
    this.targetZoomScale = scale;
  }

  /**
   * Reset camera to default state
   */
  reset() {
    // Reset focus to center
    this.focusXPos = this.halfWidth;
    this.focusYPos = this.halfHeight;

    // Set target camera coordinates for smooth interpolation
    this.targetX = 0;
    this.targetY = 0;

    // Smoothly reset zoom scale to 1
    this.targetZoomScale = 1;
  }
}
