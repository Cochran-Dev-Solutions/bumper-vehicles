import StaticActor from "./StaticActor.js";

export default class CheckpointActor extends StaticActor {
  constructor(config) {
    super(config);
    this.radius = config.radius || 30;
    this.checkpointId = config.checkpointId || 0;
    this.activated = config.activated || false;
    this.activatedBy = config.activatedBy || [];
  }

  display() {
    this.p.push();
    
    // Draw checkpoint circle
    this.p.stroke(128); // Grey stroke
    this.p.strokeWeight(4); // Thick stroke
    this.p.noFill();
    
    // If activated by the local player, fill with a different color
    if (this.activated && this.activatedBy.includes(this.game.player_id)) {
      this.p.fill(0, 255, 0, 100); // Semi-transparent green
    } else if (this.activated) {
      this.p.fill(255, 255, 0, 100); // Semi-transparent yellow for other players
    }
    
    this.p.circle(this.x + this.radius, this.y + this.radius, this.radius * 2);
    
    // Draw checkpoint number
    this.p.fill(128);
    this.p.noStroke();
    this.p.textSize(16);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(this.checkpointId, this.x + this.radius, this.y + this.radius);
    
    this.p.pop();
  }

  updateState(newState) {
    super.updateState(newState);
    if (newState.activated !== undefined) {
      this.activated = newState.activated;
    }
    if (newState.activatedBy !== undefined) {
      this.activatedBy = newState.activatedBy;
    }
  }
} 