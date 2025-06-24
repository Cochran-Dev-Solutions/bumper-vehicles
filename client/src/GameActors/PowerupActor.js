import DynamicActor from "./DynamicActor";

class PowerupActor extends DynamicActor {
  static powerupTypes = new Map([
    ['mine', {
      imageURL: 'Powerups/mine.png',
      display: function (p) {
        this.rotation += 0.02;
      }
    }],
    ['missile', {
      imageURL: 'Powerups/missile.png',
      display: function (p) {

      }
    }],
    ['heart', {
      imageURL: 'Powerups/heart.png',
      display: function (p) {
        this.scaleX += 0.75;
        this.scaleY += 0.75;
        this.opacity += (0 - this.opacity) / 15;
      }
    }]
  ]);

  constructor(config) {
    super({ ...config });

    // Get the powerup data from the game's powerupTypes map
    const powerupData = PowerupActor.powerupTypes.get(config.powerup_type);
    if (powerupData) {
      this.imageNames.push(powerupData.imageURL);
      // Create a per-instance display function that calls the shared one with the correct context
      this.displayPowerup = function (p) {
        powerupData.display.call(this, p);
      };
      this.powerupData = powerupData;
    } else {
      console.warn(`No data found for powerup type: ${config.powerup_type}`);
    }
  }

  update() {
    // calls power-specific display data
    this.displayPowerup(this.p);

    // displays powerup sprite data
    this.display();
  }
}

export default PowerupActor;