import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import socket from "../networking/socket.js";
import { gameInfo } from "../globals.js";
import GameRenderer from "../GameActors/GameRenderer.js";

let gameRenderer;

let loading = true;

const buttons = {
  disconnect: new Button({
    width: 100,
    height: 30,
    display: function () {
      const p = sceneManager.getCanvas();
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(1);
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      }
      p.rect(this.x, this.y, this.width, this.height);
      p.fill(0);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Disconnect", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      socket.disconnect();
    },
  }),
};

const gameScene = {
  name: "Game Scene",
  init: async function () {
    gameRenderer = new GameRenderer({
      p: sceneManager.getCanvas(),
    });

    await gameRenderer.setup(sceneManager.getCanvas(), gameInfo);
    loading = false;
  },
  display: function () {
    const p = sceneManager.getCanvas();
    if (loading) {
      p.background(51);
      p.fill(255, 0, 0);
      p.text("Loading...", p.width / 2, p.height / 2);
    } else {
      try {
        gameRenderer.update();
      } catch (error) {
        console.error("Error updating game:", error);
        sceneManager.createTransition("map");
      }
    }

    // Update button position
    buttons["disconnect"].update(10, 10);
  },
  buttons: Object.values(buttons),
};

export default gameScene;
