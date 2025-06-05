import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import socket from "../networking/socket.js";
import { gameInfo } from "../globals.js";
import gameRenderer from "../GameActors/GameRenderer.js";

let loading = true;

const gameScene = {
  name: "Game Scene",
  init: async function () {
    await gameRenderer.setup(sceneManager.getCanvas(), gameInfo);

    loading = false;
  },

  display: function () {
    const p = sceneManager.getCanvas();

    if (loading) {
      // Clear background
      p.background(51);
      p.fill(255, 0, 0);
      p.text("Loading...", p.width / 2, p.height / 2);
    } else {
      gameRenderer.update();
    }
  },

  buttons: [
    // Disconnect button
    new Button({
      x: 10,
      y: 10,
      width: 100,
      height: 30,
      display: function () {
        const p = sceneManager.getCanvas();

        p.fill(255);
        p.stroke(0);
        p.strokeWeight(1);

        if (this.isInside(mouse, this)) {
          p.fill(175);
          mouse.setCursor('pointer');
        }

        p.rect(this.x, this.y, this.width, this.height);

        p.fill(0);
        p.textSize(16);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Disconnect', this.x + this.width / 2, this.y + this.height / 2);
      },
      onClick: function () {
        socket.disconnect();
      }
    })
  ]
};

export default gameScene; 