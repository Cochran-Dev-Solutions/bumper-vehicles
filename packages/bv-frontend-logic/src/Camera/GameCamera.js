import Camera from './Camera.js';

export default class GameCamera extends Camera {
  constructor(x, y, width, height, info) {
    super(x, y, width, height, info);
    
    // Game-specific camera properties
    this.targetPlayer = null;
  }
  
  /**
   * Sets the player to track
   * @param {Object} player - The player object to track
   */
  setTargetPlayer(player) {
    this.targetPlayer = player;
  }
  
  /**
   * Tracks a player's position for game scenes - direct following
   * @param {Object} object - The object to track (player with x, y, radius properties)
   */
  track(object) {
    // Use target player if no object specified
    if (!object && this.targetPlayer) {
      object = this.targetPlayer;
    }
    
    // If no object to track, don't move camera
    if (!object) {
      return;
    }
    
    // For game scenes, we typically track the center of the player
    // Players usually have radius instead of width/height
    const xPos = object.x + (object.radius || object.width / 2);
    const yPos = object.y + (object.radius || object.height / 2);
    
    // Calculate target camera position (center on player)
    const targetX = xPos - this.halfWidth;
    const targetY = yPos - this.halfHeight;
    
    // Direct camera positioning - no smoothing
    this.x = targetX;
    this.y = targetY;
    
    // Constrain camera to map boundaries
    this.x = this.constrain(this.x, 0, this.info.width - this.width);
    this.y = this.constrain(this.y, 0, this.info.height - this.height);
  }
  
  /**
   * Applies camera transformation to the p5.js context for game scenes
   * @param {p5} p - The p5 instance
   */
  view(p) {
    // For game scenes, we use simple translation
    p.translate(-this.x, -this.y);
  }
  
  /**
   * Updates camera dimensions and recalculates constraints
   * @param {number} width - New width
   * @param {number} height - New height
   */
  updateDimensions(width, height) {
    super.updateDimensions(width, height);
    
    // Recalculate constraints with new dimensions
    this.x = this.constrain(this.x, 0, this.info.width - this.width);
    this.y = this.constrain(this.y, 0, this.info.height - this.height);
  }
  
  /**
   * Reset camera position (useful when player respawns or teleports)
   */
  resetSmoothing() {
    if (this.targetPlayer) {
      const xPos = this.targetPlayer.x + (this.targetPlayer.radius || this.targetPlayer.width / 2);
      const yPos = this.targetPlayer.y + (this.targetPlayer.radius || this.targetPlayer.height / 2);
      
      const targetX = xPos - this.halfWidth;
      const targetY = yPos - this.halfHeight;
      
      // Instantly snap to target
      this.x = targetX;
      this.y = targetY;
    }
  }
} 