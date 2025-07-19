import mouse from "./MouseManager.js";
import timeManager from "./TimeManager.js";
import ajax from "../networking/ajax.js";
import { removeForms } from "../render-tools/htmlForms.js";

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
    this.sceneParameters = config.sceneParameters || {};
    this.loading = false; // Loading overlay flag
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

  async setScene(name) {
    mouse.removeAllCallbacks();
    mouse.onClick(() => {
      this.handleButtons();
    });

    if (this.currentScene && typeof this.currentScene.cleanup === "function") {
      this.currentScene.cleanup.call(this.currentScene);
    }

    removeForms();

    // Show loading overlay
    this.showLoading();

    if (Object.prototype.hasOwnProperty.call(this.scenes, name)) {
      if (typeof this.scenes[name].init === "function") {
        await this.scenes[name].init.call(this.scenes[name], this.sceneParameters);
      }
      this.currentScene = this.scenes[name];
    } else {
      console.log(`Scene '${name}' does not exist.`);
    }

    // Hide loading overlay
    this.hideLoading();
  }

  displayScene() {
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

  static openScene(onFinish) {
    startTransitionOverlay("open", onFinish);
  }

  static closeScene(onFinish) {
    startTransitionOverlay("close", onFinish);
  }

  createTransition(targetScene, cb = () => {}) {
    sceneManager.transitioning = true;
    SceneManager.closeScene(async function () {
      // Show loading overlay
      sceneManager.showLoading();
      if (
        Object.prototype.hasOwnProperty.call(sceneManager.scenes, targetScene) &&
        typeof sceneManager.scenes[targetScene].init === "function"
      ) {
        await sceneManager.scenes[targetScene].init.call(sceneManager.scenes[targetScene], sceneManager.sceneParameters);
      }
      sceneManager.currentScene = sceneManager.scenes[targetScene];
      // Hide loading overlay
      sceneManager.hideLoading();
      cb();
      SceneManager.openScene(function () {
        sceneManager.transitioning = false;
      });
    });
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }

  static drawLoadingOverlay(p) {
    if (!p) return;
    p.push();
    p.noStroke();
    p.fill(30, 30, 40, 220);
    p.rect(0, 0, p.width, p.height);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.text("Loading...", p.width / 2, p.height / 2);
    p.pop();
  }

  async initUser() {
    this.user = {
      powerups: ["mine", "missile", "heart", "shockwave", "biggy"],
      logged_in: false,
    };
    try {
      const res = await ajax.get("/me");
      if (res.ok && res.data) {
        this.user = {
          ...res.data,
          powerups: ["mine", "missile", "heart", "shockwave", "biggy"],
          logged_in: true,
        };
      } else {
        this.user = {
          powerups: ["mine", "missile", "heart", "shockwave", "biggy"],
          logged_in: false,
        };
      }
    } catch (e) {
      this.user = {
        powerups: ["mine", "missile", "heart", "shockwave", "biggy"],
        logged_in: false,
      };
    }
  }
}

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
