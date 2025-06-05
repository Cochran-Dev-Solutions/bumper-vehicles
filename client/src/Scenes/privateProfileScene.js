import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";

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
    const p = sceneManager.getCanvas();
    if (!p) return; // Guard clause to prevent null canvas access

    // Clear background
    p.background(51);

    // Display profile information
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Username: ${this.profileData.username}`, 50, 50);
    p.text(`Level: ${this.profileData.level}`, 50, 90);
    p.text(`Experience: ${this.profileData.experience}`, 50, 130);
  },
  buttons: [
    new Button({
      x: window.innerWidth - 125,
      y: 25,
      width: 100,
      height: 50,
      display: function () {
        const p = sceneManager.getCanvas();
        if (!p) return; // Guard clause to prevent null canvas access

        p.stroke(255);
        p.strokeWeight(5);

        if (this.isInside(mouse, this)) {
          p.fill(175);
          mouse.setCursor('pointer');
        } else {
          p.fill(200, 200, 200, 200);
        }
        p.rect(this.x, this.y, this.width, this.height);

        p.fill(0);
        p.textSize(20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Map', this.x + this.width / 2, this.y + this.height / 2);
      },
      onClick: function () {
        sceneManager.createTransition('map');
      }
    })
  ]
};

export default privateProfileScene; 