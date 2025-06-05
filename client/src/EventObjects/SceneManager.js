import keyManager from "./KeyManager.js";
import mouse from "./MouseManager.js";
import timeManager from "./TimeManager.js";
import p5 from 'p5';
import Button from "./Button.js";

// Forward declaration of sceneManager
let sceneManager;

class SceneManager {
  constructor(config) {
    this.scenes = {};
    this.currentScene = null;
    this.transitioning = false;
    this.targetScene = null;
    this.setup = function () { };
    this.p = null;

    // extra configuration details to pass to scenes
    this.sceneParameters = config.sceneParameters || {};
  }

  attachCanvas(p5Instance) {
    this.p = p5Instance;
  }

  getCanvas() {
    return this.p;
  }

  addScene(name, scene) {
    this.scenes[name] = {
      name: scene.name,
      init: scene.init,
      display: scene.display,
      buttons: scene.buttons || []
    };
  }

  setScene(name) {
    // adds this.handleButtons() as callback to mouse.onClick()
    mouse.removeAllCallbacks();
    mouse.onClick(() => {
      this.handleButtons();
    });

    if (this.scenes.hasOwnProperty(name)) {
      this.currentScene = this.scenes[name];
      this.currentScene.init(this.sceneParameters);
    } else {
      console.log(`Scene '${name}' does not exist.`);
    }
  }

  displayScene() {
    if (this.currentScene) {
      this.currentScene.display(this.sceneParameters);

      for (let i = 0; i < this.currentScene.buttons.length; i++) {
        const button = this.currentScene.buttons[i];
        button.display();
      }
    }
  }

  handleButtons() {
    if (!this.transitioning && this.currentScene) {
      for (let i = 0; i < this.currentScene.buttons.length; i++) {
        const button = this.currentScene.buttons[i];
        button.handleClick(mouse);
      }
    }
  }

  /**
   * Opens the scene with a sliding transition effect
   * @param {Function} onFinish - Callback function to execute when transition completes
   */
  static openScene(onFinish) {
    timeManager.addInterval({
      callback: function () {
        // Clear the previous frame
        sceneManager.p.clear();

        // Get canvas dimensions
        const w = sceneManager.p.width;
        const h = sceneManager.p.height;

        // Calculate the closed amount (how much of the screen is still covered)
        const closed = w / 2 - (this.time / this.duration) * w / 2;

        // Set fill color to red
        sceneManager.p.fill('red');
        sceneManager.p.noStroke();

        // Draw the sliding rectangles
        sceneManager.p.rect(-w / 2 + closed, 0, w / 2, h);
        sceneManager.p.rect(w - closed, 0, w / 2, h);
      },
      duration: 25,
      onFinish: onFinish
    });
  }

  /**
   * Closes the scene with a sliding transition effect
   * @param {Function} onFinish - Callback function to execute when transition completes
   */
  static closeScene(onFinish) {
    timeManager.addInterval({
      callback: function () {
        // Clear the previous frame
        sceneManager.p.clear();

        // Get canvas dimensions
        const w = sceneManager.p.width;
        const h = sceneManager.p.height;

        // Calculate the closed amount (how much of the screen is covered)
        const closed = 0 + (this.time / this.duration) * w / 2;

        // Set fill color to red
        sceneManager.p.fill('red');
        sceneManager.p.noStroke();

        // Draw the sliding rectangles
        sceneManager.p.rect(-w / 2 + closed, 0, w / 2, h);
        sceneManager.p.rect(w - closed, 0, w / 2, h);
      },
      duration: 25,
      onFinish: onFinish
    });
  }

  createTransition(targetScene) {
    sceneManager.transitioning = true;
    SceneManager.closeScene(function () {
      sceneManager.setScene(targetScene);
      SceneManager.openScene(function () {
        sceneManager.transitioning = false;
      });
    });
  }
}

// Create and export a singleton instance
sceneManager = new SceneManager({});
export default sceneManager; 