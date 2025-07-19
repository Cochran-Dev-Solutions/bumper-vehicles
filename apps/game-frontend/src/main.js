import "./index.css";
import p5 from "p5";
import { sceneManager, mouse, keyManager, timeManager, Button, updateCurrentPublicUser, rectToRect, rectToCircle, setLoadImageAsync } from "@bv-frontend-logic";
import { loadImageAsync } from "./render-tools/images.js";
import { removeForms } from "./render-tools/htmlForms.js";

// Inject the p5.js image loader into the shared logic
setLoadImageAsync(loadImageAsync);

// Override sceneCleanup to remove forms in the web frontend
sceneManager.sceneCleanup = removeForms;

import privateProfileScene from "./Scenes/privateProfileScene.js";
import mapScene from "./Scenes/mapScene.js";
import gameScene from "./Scenes/gameScene.js";
import menuScene from "./Scenes/menuScene.js";
import loginScene from "./Scenes/loginScene.js";
import signupScene from "./Scenes/signupScene.js";
import publicProfileScene from "./Scenes/publicProfileScene.js";
import animationTestingScene from "./Scenes/animationTestingScene.js";

/////////////////////////////////////////////////////
// Register action labels for key codes
/////////////////////////////////////////////////////
keyManager.register("W", "KeyW");
keyManager.register("A", "KeyA");
keyManager.register("S", "KeyS");
keyManager.register("D", "KeyD");
keyManager.register("space", " ");
keyManager.register("enter", "Enter");
keyManager.register("Shift", "ShiftLeft");
// keyManager.register("Ctrl", "ControlLeft");
// keyManager.register("Ctrl", "ControlRight");
keyManager.register("up", "ArrowUp");
keyManager.register("down", "ArrowDown");
keyManager.register("left", "ArrowLeft");
keyManager.register("right", "ArrowRight");

// register powerup keys 1-5
keyManager.register("one", "1");
keyManager.register("two", "2");
keyManager.register("three", "3");
keyManager.register("four", "4");
keyManager.register("five", "5");
keyManager.register("z", "z");

/////////////////////////////////////////////////////
// Register Button Shape Types
/////////////////////////////////////////////////////
Button.registerType("rect", rectToRect);
Button.registerType("circle", rectToCircle);

// Create a new sketch
const sketch = (p) => {
  p.setup = async () => {
    // Create canvas that fills the window
    p.createCanvas(window.innerWidth, window.innerHeight);

    // Attach canvas to scene manager
    sceneManager.attachCanvas(p);

    // Register scenes
    sceneManager.addScene("profile", privateProfileScene);
    sceneManager.addScene("map", mapScene);
    sceneManager.addScene("game", gameScene);
    sceneManager.addScene("menu", menuScene);
    sceneManager.addScene("login", loginScene);
    sceneManager.addScene("signup", signupScene);
    sceneManager.addScene("publicProfile", publicProfileScene);
    sceneManager.addScene("animationTesting", animationTestingScene);

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
    sceneManager.setScene("map");
    //sceneManager.setScene("animationTesting");

    // Initialize mouse event listeners
    mouse.handleEvents();

    // Set up key event handlers
    p.keyPressed = (event) => {
      keyManager.keyPressed(event.key);
    };

    p.keyReleased = (event) => {
      keyManager.keyReleased(event.key);
    };
  };

  // Handle window resize
  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    // window.location.reload();
  };

  p.draw = () => {
    p.background(51);

    // Reset mouse cursor to default
    mouse.setCursor("default");

    // Update mouse position relative to canvas
    const canvasRect = p.canvas.getBoundingClientRect();
    mouse.move(p.mouseX + canvasRect.left, p.mouseY + canvasRect.top);

    sceneManager.displayScene();

    // Render loading overlay if active
    if (sceneManager.loading) {
      sceneManager.constructor.drawLoadingOverlay(p);
    }

    // Run time intervals
    timeManager.runIntervals();
  };
};

// Create new p5 instance with our sketch
new p5(sketch, document.getElementById("app-canvas"));

// used by scene transition to create an extra sketch
window.p5 = p5;

// Create persistent overlay p5 instance for transitions
window.overlayTransition = null;
window.overlayP5 = new p5((p) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight).parent(
      document.getElementById("overlay-canvas")
    );
    p.clear();
  };
  p.draw = () => {
    p.clear();
    const t = window.overlayTransition;
    if (t) {
      let w = window.innerWidth;
      let h = window.innerHeight;
      let closed;
      if (t.type === "open") {
        closed = w / 2 - ((t.frame / t.duration) * w) / 2;
      } else {
        closed = 0 + ((t.frame / t.duration) * w) / 2;
      }
      p.fill(255, 255, 255);
      p.noStroke();
      p.rect(-w / 2 + closed, 0, w / 2, h);
      p.rect(w - closed, 0, w / 2, h);
      t.frame++;
      if (t.frame > t.duration) {
        window.overlayTransition = null;
        if (typeof t.onFinish === "function") t.onFinish();
      }
    }
  };
  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    p.clear();
  };
}, document.getElementById("overlay-canvas"));
