class Camera {
  constructor(p) {
    this.p = p;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.targetX = 0;
    this.targetY = 0;
    this.targetScale = 1;
    this.transitionSpeed = 0.1;
    this.isTransitioning = false;
  }

  // Set target position and scale for smooth transition
  setTarget(x, y, scale) {
    this.targetX = x;
    this.targetY = y;
    this.targetScale = scale;
    this.isTransitioning = true;
  }

  // Update camera position and scale
  update() {
    if (!this.isTransitioning) return;

    // Smooth transition to target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dScale = this.targetScale - this.scale;

    this.x += dx * this.transitionSpeed;
    this.y += dy * this.transitionSpeed;
    this.scale += dScale * this.transitionSpeed;

    // Check if transition is complete
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(dScale) < 0.01) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.scale = this.targetScale;
      this.isTransitioning = false;
    }
  }

  // Apply camera transformation
  apply() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.scale(this.scale);
  }

  // Restore camera transformation
  restore() {
    this.p.pop();
  }

  // Reset camera to original state
  reset() {
    this.setTarget(0, 0, 1);
  }

  // Zoom to specific position (e.g., center of screen)
  zoomTo(x, y, scale) {
    // Calculate position to center the target on screen
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    const targetX = centerX - x * scale;
    const targetY = centerY - y * scale;

    this.setTarget(targetX, targetY, scale);
  }

  // Check if camera is still transitioning
  isInTransition() {
    return this.isTransitioning;
  }
}

export default Camera;
