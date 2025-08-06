export class AnimatedSprite {
  constructor({ images = [] }) {
    this.images = images;
    this.currentFrame = 0;
    this.frameCount = images.length;
    this.paused = false;
    this.lastFrameTime = 0;
    this.frameDuration = 100; // Default frame duration in milliseconds (10 FPS)

    // Animation state
    this.animationMode = "loop"; // 'loop', 'once', 'pingpong', 'reverse'
    this.isReversed = false;
    this.onComplete = null; // Callback for when animation completes
  }

  /**
   * Display the animated sprite at the specified position and size
   * @param {p5} p - The p5 instance
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of the sprite
   * @param {number} height - Height of the sprite
   */
  display(p, x, y, width, height) {
    if (!this.paused) {
      const currentTime = p.millis();

      // Update frame if enough time has passed
      if (currentTime - this.lastFrameTime >= this.frameDuration) {
        this.updateFrame();
        this.lastFrameTime = currentTime;
      }
    }

    // Draw the current frame using p5.js image function
    if (this.images[this.currentFrame]) {
      p.image(
        this.images[this.currentFrame],
        x,
        y,
        width,
        height
      );
    }
  }

  /**
   * Update the current frame based on animation mode
   */
  updateFrame() {
    switch (this.animationMode) {
      case "loop":
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        break;

      case "once":
        if (this.currentFrame < this.frameCount - 1) {
          this.currentFrame++;
        } else {
          this.pause();
          if (this.onComplete) this.onComplete();
        }
        break;

      case "pingpong":
        if (this.isReversed) {
          if (this.currentFrame > 0) {
            this.currentFrame--;
          } else {
            this.isReversed = false;
            this.currentFrame++;
          }
        } else {
          if (this.currentFrame < this.frameCount - 1) {
            this.currentFrame++;
          } else {
            this.isReversed = true;
            this.currentFrame--;
          }
        }
        break;

      case "reverse":
        if (this.currentFrame > 0) {
          this.currentFrame--;
        } else {
          this.currentFrame = this.frameCount - 1;
        }
        break;
    }
  }

  /**
   * Set the animation mode
   * @param {string} mode - 'loop', 'once', 'pingpong', or 'reverse'
   * @param {Function} onComplete - Optional callback for when animation completes (for 'once' mode)
   */
  setAnimationMode(mode, onComplete = null) {
    this.animationMode = mode;
    this.onComplete = onComplete;
    this.reset();
  }

  /**
   * Pause the animation
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume the animation
   */
  resume() {
    this.paused = false;
    this.lastFrameTime = 0;
  }

  /**
   * Reset the animation to the first frame
   */
  reset() {
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.isReversed = false;
    this.paused = false;
  }

  /**
   * Set the animation speed
   * @param {number} fps - Frames per second
   */
  setAnimationSpeed(fps) {
    this.frameDuration = 1000 / fps;
  }

  /**
   * Set frame-specific durations
   * @param {Array} durations - Array of durations in milliseconds for each frame
   */
  setFrameDurations(durations) {
    if (durations.length !== this.frameCount) {
      console.warn("Frame durations array length must match number of frames");
      return;
    }
    this.frameDurations = durations;
  }

  /**
   * Check if the animation is complete (for 'once' mode)
   * @returns {boolean}
   */
  isComplete() {
    return this.animationMode === "once" && this.currentFrame === this.frameCount - 1;
  }
}

export default AnimatedSprite; 