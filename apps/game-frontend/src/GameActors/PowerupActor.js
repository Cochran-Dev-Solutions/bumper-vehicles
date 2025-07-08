import DynamicActor from "./DynamicActor";

class PowerupActor extends DynamicActor {
  static powerupTypes = new Map([
    ["mine", {
      imageURL: "Powerups/mine.png",
      display: function () {
        if (this.deactivated) {
          // todo: explosion instead of shake
          this.rotation += Math.sin(Date.now() / 125) / 20;

          this.blowUpTime++;
          if (this.blowUpTime > 50) {
            this.superRemoveFromGame();
          }
        } else {
          this.rotation += 0.02;
        }
      },
      removeFromGame() {
        this.blowUpTime = 0;
        this.deactivated = true;
      }
    }],
    ["missile", {
      imageURL: "Powerups/missile.png",
      display: function () {

      }
    }],
    ["heart", {
      imageURL: "Powerups/heart.png",
      display: function () {
        this.scaleX += 0.75;
        this.scaleY += 0.75;
        this.opacity += (0 - this.opacity) / 15;
      }
    }],
    ['biggy', {
      imageURL: 'Powerups/biggy.png',
      display: function (p) {
        this.scaleX += 0.75;
        this.scaleY += 0.75;
        this.opacity += (0 - this.opacity) / 15;
      }
    }],
    ['magnet', {
      imageURL: 'Powerups/magnet.png',
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
      this.displayPowerup = function () {
        powerupData.display.call(this, this.p);
      };
      if (powerupData.removeFromGame) {
        this.superRemoveFromGame = super.removeFromGame;
        this.removeFromGame = function () {
          powerupData.removeFromGame.call(this, this.p);
        };
      }
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