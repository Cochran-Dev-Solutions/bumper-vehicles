import mouse from "./MouseManager.js";
import timeManager from "./TimeManager.js";
import ajax from "../networking/ajax.js";
// import { removeForms } from "../utils/htmlForms.js";

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
    
    this.sceneCleanup = () => {}; // No-op by default, can be overridden

    this.loadingImages = false;
    this.load_operations = [];
    this.total_estimated_time = 0;
    this.progress = 0;
    this.currentOperationName = "";
    this.hasRunInitialSetup = false;
  }

  handleRouting () {
    // Parse the path for /user/:username
    // const path = window.location.pathname;
    // const userMatch = path.match(/^\/user\/([^/]+)$/);
    // if (userMatch) {
    //   const username = decodeURIComponent(userMatch[1]);
    //   updateCurrentPublicUser(username);
    //   sceneManager.setScene("publicProfile");
    // } else {
    //   sceneManager.setScene("menu");
    // }

    // temp: for testing
    this.setScene("garage");
    //sceneManager.setScene("animationTesting");
  }
  

  async runInitialSetup() {
    this.hasRunInitialSetup = true;
    this.loadingImages = true;
    await this.run_load_operations();
    this.loadingImages = false;
    this.handleRouting();
  }

  add_load_operation({ operation, name, estimated_time }) {
    this.load_operations.push({ operation, name, estimated_time });
    this.total_estimated_time += estimated_time;
  }

  async run_load_operations() {
    let completed_time = 0;
    for (let i = 0; i < this.load_operations.length; i++) {
      const op = this.load_operations[i];
      this.currentOperationName = op.name;
      // Progress up to the start of this operation
      this.progress = completed_time / this.total_estimated_time;
      await op.operation();
      // After operation, progress is frozen until next op
      completed_time += op.estimated_time || 1;
      this.progress = completed_time / this.total_estimated_time;
    }
    this.progress = 1;
    this.currentOperationName = "";
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

    this.sceneCleanup();

    if (Object.prototype.hasOwnProperty.call(this.scenes, name)) {
      if (typeof this.scenes[name].init === "function") {
        await this.scenes[name].init.call(this.scenes[name], this.sceneParameters);
      }
      this.currentScene = this.scenes[name];
    } else {
      console.log(`Scene '${name}' does not exist.`);
    }
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
      if (
        Object.prototype.hasOwnProperty.call(sceneManager.scenes, targetScene) &&
        typeof sceneManager.scenes[targetScene].init === "function"
      ) {
        await sceneManager.scenes[targetScene].init.call(sceneManager.scenes[targetScene], sceneManager.sceneParameters);
      }
      sceneManager.currentScene = sceneManager.scenes[targetScene];
      cb();
      SceneManager.openScene(function () {
        sceneManager.transitioning = false;
      });
    });
  }

  static drawLoadingOverlay(p) {
    
    if (!p) return;
    const mgr = sceneManager;
    p.push();
    p.noStroke();
    p.fill(30, 30, 40, 220);
    p.rect(0, 0, p.width, p.height);

    // Draw loading text
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(24);
    p.text(
      mgr.currentOperationName || "Loading...",
      p.width / 2,
      p.height / 2 - 40
    );

    // Draw loading bar background
    const barWidth = p.width * 0.5;
    const barHeight = 28;
    const barX = (p.width - barWidth) / 2;
    const barY = p.height / 2;
    p.fill(60, 60, 60, 255);
    p.rect(barX, barY, barWidth, barHeight, 8);

    // Draw loading bar progress (green)
    const progress = Math.max(0, Math.min(1, mgr.progress || 0));
    p.fill(0, 200, 80, 255);
    p.rect(barX, barY, barWidth * progress, barHeight, 8);

    p.pop();
  }

  async initUser() {
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
