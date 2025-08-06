import {
  Button,
  mouse,
  sceneManager,
  ajax,
  updateCurrentPublicUser,
} from "client-logic";

const buttons = {
  play: new Button({
    width: 100,
    height: 50,
    display: function () {
      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);

      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Play", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      sceneManager.createTransition("map");
    },
  }),
  login: new Button({
    width: 100,
    height: 50,
    display: function () {
      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);

      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Login", this.x + this.width / 2, this.y + this.height / 2);
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
      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);

      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Signup", this.x + this.width / 2, this.y + this.height / 2);
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
      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);

      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Logout", this.x + this.width / 2, this.y + this.height / 2);
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
      this.p.noStroke();
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      } else {
        this.p.fill(200, 200, 200, 200);
      }
      this.p.rect(this.x, this.y, this.width, this.height);
      this.p.fill(0);
      this.p.textSize(20);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(
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
    this.p.background(51);

    // Display profile information
    this.p.fill(255);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.TOP);
    this.p.noStroke();
    this.p.text("Menu Scene:", this.p.width / 2, 50);

    Button.setAlignment("center", "center");
    buttons["play"].update(this.p.width / 2, 200);
    buttons["publicProfile"].update(this.p.width / 2, 265);
    if (!sceneManager.user || !sceneManager.user.logged_in) {
      buttons["login"].update(this.p.width / 2, 340);
      buttons["signup"].update(this.p.width / 2, 415);
    } else if (sceneManager.user && sceneManager.user.logged_in) {
      buttons["logout"].update(this.p.width / 2, 340);
    }
  },
  buttons: Object.values(buttons),
};

export default privateProfileScene;
