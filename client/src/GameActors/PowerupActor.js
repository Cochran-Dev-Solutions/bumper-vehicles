class PowerupActor {
  constructor(config) {
    this.p = config.p; // in the game actor you had this twice, any reason?
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.img = config.img; // Assuming img is an image object
  }
  display() {
      this.p.push();
      this.p.fill(255, 0, 0);
      this.p.rect(this.x, this.y, this.width, this.height);
      this.p.pop();
      // this.p.image(this.img, this.x, this.y, this.width, this.height);
      // add this once we have an image for it
  }
  update() {
    this.display();
  }
}

export default PowerupActor;