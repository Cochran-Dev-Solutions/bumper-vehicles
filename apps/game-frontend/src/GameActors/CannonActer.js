import StaticActor from "./StaticActor.js";


export class CannonActor extends StaticActor {
  constructor(config) {
    super({ ...config, isAnimated: true, width: config.radius * 2, height: config.radius * 2 });

    this.angle = 0;

    this.timer = 0;
    this.newAngle = 0;
  }
  
  display() {
    this.p.pushMatrix();

    this.p.translate(this.x, this.y);
    this.rotate(this.angle);

    this.p.rectMode(this.p.CENTER);
    
    this.p.fill(255, 0, 0);
    this.p.rect(0, 0, this.width, this.height);
    this.p.ellipse(0, 0, 10, 10);

    this.p.popMatrix();
  }

  rotate() {
    this.timer++;
    if(this.timer > 150) {
        this.angle -= (this.angle-this.newAngle)/5;
    }
    if(this.timer > 200) {
        this.timer = 0;
        this.newAngle += 50;
    }
  }

  update() {
    
  }
} 