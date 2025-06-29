import sceneManager from "./SceneManager";
import mouse from "./MouseManager.js";

export default class Button {
  constructor(config) {
    this.display = config.display || function () {};
    this.onClick = config.onClick || function () {};
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    // Extra args
    this.args = config.args || {};

    this.shape = config.shape || "rect";
    this.side = config.side || "left";
    this.theta = config.theta || 0;

    this.p = null;

    // Button state properties
    this.disabled = config.disabled || false;
    this.text = config.text || "";
    this.loadingText = config.loadingText || "Loading...";
  }

  static types = {};

  static alignment = ["TOP", "LEFT"];

  static setAlignment(horizontal, vertical) {
    Button.alignment = [horizontal, vertical];
  }

  static registerType(type, func) {
    Button.types[type] = func;
  }

  // Assumes obj is a rectangle
  isInside(obj) {
    // Calculate adjusted x/y based on alignment
    let adjX = this.x;
    let adjY = this.y;
    if (Button.alignment[0] === "center") {
      adjX = this.x - this.width / 2;
    } else if (Button.alignment[1] === "right") {
      adjX = this.x - this.width;
    }
    if (Button.alignment[1] === "center") {
      adjY = this.y - this.height / 2;
    } else if (Button.alignment[2] === "bottom") {
      adjY = this.y - this.height;
    }
    // Create a temp rect for hitbox
    const hitbox = {
      x: adjX,
      y: adjY,
      width: this.width,
      height: this.height,
    };
    return Button.types[this.shape](obj, hitbox);
  }

  handleClick(obj) {
    if (this.isInside(obj) && !this.disabled) {
      this.onClick();
    }
  }

  update(x, y) {
    this.x = x || this.x;
    this.y = y || this.y;

    if (sceneManager.getCanvas()) {
      this.p = sceneManager.getCanvas();
      this.p.push();
      if (Button.alignment[0] === "center") {
        this.p.translate(-this.width / 2, 0);
      } else if (Button.alignment[1] === "right") {
        this.p.translate(-this.width, 0);
      }

      if (Button.alignment[1] === "center") {
        this.p.translate(0, -this.height / 2);
      } else if (Button.alignment[2] === "bottom") {
        this.p.translate(0, -this.height);
      }

      this.display();
      this.p.pop();
    }

    // Set cursor to pointer if mouse is inside button and not disabled
    if (mouse && this.isInside(mouse) && !this.disabled) {
      mouse.setCursor("pointer");
    } else if (mouse && this.isInside(mouse) && this.disabled) {
      mouse.setCursor("default");
    }
  }
}
