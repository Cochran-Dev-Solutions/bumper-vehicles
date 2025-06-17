import DynamicActor from "./DynamicActor";

class PowerupActor extends DynamicActor {
  constructor(config) {
    super({ ...config });

    // Get the image path from the game's powerupImages map
    const imagePath = this.game.powerupImages.get(config.powerup_type);
    if (imagePath) {
      this.imageNames.push(imagePath);
    } else {
      console.warn(`No image path found for powerup type: ${config.powerup_type}`);
    }
  }

  update() {
    this.display();
  }
}

export default PowerupActor;