import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import ajax from "../networking/ajax.js";
import { updateCurrentPublicUser } from "../globals.js";

const buttons = {
  play: new Button({
    width: 100,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;

      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);

      p.fill(0);
      p.textSize(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Play", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      sceneManager.createTransition("map");
    },
  }),
  login: new Button({
    width: 100,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;

      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);

      p.fill(0);
      p.textSize(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Login", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (!sceneManager.user || !sceneManager.user.logged_in) {
        sceneManager.createTransition("login");
      }
    },
  }),
  signup: new Button({
    width: 100,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;

      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);

      p.fill(0);
      p.textSize(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Signup", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (!sceneManager.user || !sceneManager.user.logged_in) {
        sceneManager.createTransition("signup");
      }
    },
  }),
  logout: new Button({
    width: 100,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;

      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);

      p.fill(0);
      p.textSize(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Logout", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      // send POST /logout request
      if (sceneManager.user && sceneManager.user.logged_in) {
        sceneManager.createTransition("menu", () => {
          ajax.post("/logout");
          sceneManager.user = null;
        });
      }
    },
  }),
  publicProfile: new Button({
    width: 300,
    height: 50,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);
      p.fill(0);
      p.textSize(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(
        "View Public Profile (bumper_master2)",
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    },
    onClick: function () {
      updateCurrentPublicUser("bumper_master2");
      sceneManager.createTransition("publicProfile");
    },
  }),
};

const privateProfileScene = {
  name: "Menu",
  init: function () {},
  display: function () {
    const p = sceneManager.getCanvas();
    if (!p) return; // Guard clause to prevent null canvas access

    // Clear background
    p.background(51);

    // Display profile information
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER, p.TOP);
    p.noStroke();
    p.text("Menu Scene:", p.width / 2, 50);

    Button.setAlignment("center", "center");
    buttons["play"].update(p.width / 2, 200);
    buttons["publicProfile"].update(p.width / 2, 265);
    if (!sceneManager.user || !sceneManager.user.logged_in) {
      buttons["login"].update(p.width / 2, 340);
      buttons["signup"].update(p.width / 2, 415);
    } else if (sceneManager.user && sceneManager.user.logged_in) {
      buttons["logout"].update(p.width / 2, 340);
    }
  },
  buttons: Object.values(buttons),
};

export default privateProfileScene;
