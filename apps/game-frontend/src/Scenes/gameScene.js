import { Button, mouse, sceneManager, socket, gameInfo, globalGameRenderer } from "@bv-frontend-logic";

let loading = true;

const buttons = {
  disconnect: new Button({
    width: 100,
    height: 30,
    display: function () {
      this.p.fill(255);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      }
      this.p.rect(this.x, this.y, this.width, this.height);
      this.p.fill(0);
      this.p.textSize(16);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(
        "Disconnect",
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    },
    onClick: function () {
      socket.disconnect();
    },
  }),
};

const gameScene = {
  name: "Game Scene",
  init: async function () {
    // Use the global GameRenderer instance, already initialized
    this.gameRenderer = globalThis.globalGameRenderer;
    loading = false;
  },
  display: function () {
    if (loading) {
      this.p.background(51);
      this.p.fill(255, 0, 0);
      this.p.text("Loading...", this.p.width / 2, this.p.height / 2);
    } else {
      try {
        this.gameRenderer.update();
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
