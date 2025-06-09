import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import UI_Panel from "../EventObjects/UI_Panel.js";

let profileData = {
  username: "Player1",
  level: 5,
  experience: 750,
  // Add more profile data as needed
};

const buttons = {
  'map-button': new Button({
    width: 100,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return; // Guard clause to prevent null canvas access

      p.noStroke();
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
};

const ui_panels = [
  new UI_Panel({
    x: 0,
    y: 0,
    buttons: [
      buttons['map-button']
    ],
    layouts: {
      0: function () {
        const p = sceneManager.getCanvas();
        if (!p) return; // Guard clause to prevent null canvas access

        // Display profile information
        p.fill(255);
        p.textSize(24);
        p.textAlign(p.LEFT, p.TOP);
        p.noStroke();
        p.text(`Username: ${profileData.username}`, this.X(50), this.Y(50));
        p.text(`Level: ${profileData.level}`, this.X(50), this.Y(90));
        p.text(`Experience: ${profileData.experience}`, this.X(50), this.Y(130));

        buttons['map-button'].display(this.X(50), this.Y(50));
      }
    },
  })
];

const privateProfileScene = {
  name: "Private Profile",
  init: function () { },
  display: function () {
    const p = sceneManager.getCanvas();
    if (!p) return; // Guard clause to prevent null canvas access

    // Clear background
    p.background(51);
  },
  panels: ui_panels
};

export default privateProfileScene; 