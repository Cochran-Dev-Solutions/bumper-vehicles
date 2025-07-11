import mouse from "./MouseManager.js";
import timeManager from "./TimeManager.js";
import ajax from "../networking/ajax.js";
import { removeForms } from "../utils/htmlForms.js";

// Forward declaration of sceneManager
let sceneManager;

class SceneManager {
  constructor(config) {
    this.scenes = {};
    this.currentScene = null;
    this.transitioning = false;
    this.targetScene = null;
    this.setup = function () {};
    this.p = null;
    this.user = null; // Will hold user data if authenticated

    // extra configuration details to pass to scenes
    this.sceneParameters = config.sceneParameters || {};
  }

  attachCanvas(p5Instance) {
    this.p = p5Instance;
  }

  getCanvas() {
    if (this.p) return this.p;
    // Return a promise that resolves when this.p is set
    return new Promise((resolve) => {
      const check = () => {
        if (this.p) resolve(this.p);
        else setTimeout(check, 10);
      };
      check();
    });
  }

  addScene(name, scene) {
    scene.p = this.p;
    this.scenes[name] = scene;
  }

  setScene(name) {
    // adds this.handleButtons() as callback to mouse.onClick()
    mouse.removeAllCallbacks();
    mouse.onClick(() => {
      this.handleButtons();
    });

    // Call cleanup on the current scene before switching
    if (this.currentScene && typeof this.currentScene.cleanup === "function") {
      this.currentScene.cleanup.call(this.currentScene);
    }

    // Remove all forms before initializing the new scene
    removeForms();

    if (Object.prototype.hasOwnProperty.call(this.scenes, name)) {
      this.currentScene = this.scenes[name];
      if (typeof this.currentScene.init === "function") {
        this.currentScene.init.call(this.currentScene, this.sceneParameters);
      }
    } else {
      console.log(`Scene '${name}' does not exist.`);
    }
  }

  displayScene() {
    // Deactivate all buttons before updating/drawing
    if (this.currentScene && Array.isArray(this.currentScene.buttons)) {
      this.currentScene.buttons.forEach((btn) => (btn.active = false));
    }
    if (this.currentScene && typeof this.currentScene.display === "function") {
      this.currentScene.display.call(this.currentScene, this.sceneParameters);
    }
  }

  handleButtons() {
    if (
      !this.transitioning &&
      this.currentScene &&
      Array.isArray(this.currentScene.buttons)
    ) {
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
    startTransitionOverlay("open", onFinish);
  }

  /**
   * Closes the scene with a sliding transition effect
   * @param {Function} onFinish - Callback function to execute when transition completes
   */
  static closeScene(onFinish) {
    startTransitionOverlay("close", onFinish);
  }

  createTransition(targetScene, cb = () => {}) {
    sceneManager.transitioning = true;
    SceneManager.closeScene(function () {
      sceneManager.setScene(targetScene);
      cb();
      SceneManager.openScene(function () {
        sceneManager.transitioning = false;
      });
    });
  }

  async initUser() {
    // Default user state
    this.user = {
      powerups: ["mine", "missile", "heart"],
      logged_in: false,
    };
    try {
      const res = await ajax.get("/me");
      if (res.ok && res.data) {
        this.user = {
          ...res.data,
          powerups: ["mine", "missile", "heart"],
          logged_in: true,
        };
      } else {
        this.user = {
          powerups: ["mine", "missile", "heart"],
          logged_in: false,
        };
      }
    } catch (e) {
      this.user = {
        powerups: ["mine", "missile", "heart"],
        logged_in: false,
      };
    }
  }
}

// Create and export a singleton instance
sceneManager = new SceneManager({});
sceneManager.initUser();
export default sceneManager;

function startTransitionOverlay(type, onFinish) {
  window.overlayTransition = {
    type,
    frame: 0,
    duration: 25,
    onFinish,
  };
}
