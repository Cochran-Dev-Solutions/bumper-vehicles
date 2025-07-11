import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";

const buttons = {
  map: new Button({
    width: 100,
    height: 50,
    display: function () {
      if (!this.p) return; // Guard clause to prevent null canvas access

      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);

      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Map", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      sceneManager.createTransition("map");
    },
  }),
};

const privateProfileScene = {
  name: "Private Profile",
  init: function () {
    // Initialize profile data
    this.profileData = {
      username: "Player1",
      level: 5,
      experience: 750,
      // Add more profile data as needed
    };
  },
  display: function () {
    if (!this.p) return; // Guard clause to prevent null canvas access

    // Clear background
    this.p.background(51);

    // Display profile information
    this.p.fill(255);
    this.p.textSize(24);
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.noStroke();
    this.p.text(`Username: ${this.profileData.username}`, 50, 50);
    this.p.text(`Level: ${this.profileData.level}`, 50, 90);
    this.p.text(`Experience: ${this.profileData.experience}`, 50, 130);

    buttons["map"].update(window.innerWidth - 125, 25);
  },
  buttons: Object.values(buttons),
};

export default privateProfileScene;
