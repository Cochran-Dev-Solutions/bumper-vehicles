import StaticActor from "./StaticActor.js";

export default class FinishPortalActor extends StaticActor {
  constructor(config) {
    super(config);
    this.radius = config.radius || 40;
    this.finishedPlayers = config.finishedPlayers || [];
    this.animationTime = config.animationTime || 0;
  }

  display() {
    this.p.push();
    
    // Animated purple portal effect
    const time = this.animationTime || 0;
    const pulseSize = Math.sin(time * 0.01) * 5 + this.radius;
    const alpha = Math.sin(time * 0.005) * 50 + 150;
    
    // Outer glow
    this.p.noStroke();
    this.p.fill(128, 0, 255, alpha * 0.3);
    this.p.circle(this.x + this.radius, this.y + this.radius, pulseSize * 2.5);
    
    // Main portal
    this.p.fill(128, 0, 255, alpha);
    this.p.circle(this.x + this.radius, this.y + this.radius, pulseSize * 2);
    
    // Inner portal
    this.p.fill(255, 255, 255, alpha * 0.8);
    this.p.circle(this.x + this.radius, this.y + this.radius, pulseSize * 0.8);
    
    // Portal swirl effect
    this.p.stroke(255, 255, 255, alpha * 0.6);
    this.p.strokeWeight(2);
    this.p.noFill();
    
    for (let i = 0; i < 3; i++) {
      const angle = time * 0.02 + (i * Math.PI * 2 / 3);
      const spiralRadius = pulseSize * 0.6;
      const x1 = this.x + this.radius + Math.cos(angle) * spiralRadius;
      const y1 = this.y + this.radius + Math.sin(angle) * spiralRadius;
      const x2 = this.x + this.radius + Math.cos(angle + 0.5) * spiralRadius * 0.8;
      const y2 = this.y + this.radius + Math.sin(angle + 0.5) * spiralRadius * 0.8;
      this.p.line(x1, y1, x2, y2);
    }
    
    // Draw "FINISH" text
    this.p.fill(255, 255, 255);
    this.p.noStroke();
    this.p.textSize(14);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("FINISH", this.x + this.radius, this.y + this.radius);
    
    this.p.pop();
  }

  updateState(newState) {
    super.updateState(newState);
    if (newState.finishedPlayers !== undefined) {
      this.finishedPlayers = newState.finishedPlayers;
    }
    if (newState.animationTime !== undefined) {
      this.animationTime = newState.animationTime;
    }
  }
} 