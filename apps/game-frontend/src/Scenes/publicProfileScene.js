import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import { currentPublicUser } from "../globals.js";
import ajax from "../networking/ajax.js";

const buttons = {
  menu: new Button({
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
      p.text("Menu", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      sceneManager.createTransition("menu");
    },
  }),
  getPublicUrl: new Button({
    width: 200,
    height: 40,
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
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(
        "Get public URL",
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    },
    onClick: function () {
      const url = `${window.location.origin}/user/${currentPublicUser}`;
      navigator.clipboard.writeText(url);
      if (typeof window !== "undefined") {
        window._publicProfileCopied = true;
        setTimeout(() => {
          window._publicProfileCopied = false;
        }, 1200);
      }
    },
  }),
};

const publicProfileScene = {
  name: "Public Profile",
  init: async function () {
    this.loading = true;
    this.error = null;
    this.profileData = null;
    const username = currentPublicUser;
    if (!username) {
      this.error = "No username provided.";
      this.loading = false;
      return;
    }
    try {
      const res = await ajax.get(
        `/users/username/${encodeURIComponent(username)}`
      );
      if (res.ok && res.data) {
        this.profileData = res.data.data;
        console.log("Testing profile data 1: ", this.profileData);
      } else {
        this.error = res.message || "User not found.";
      }
    } catch (e) {
      this.error = e.message || "Failed to fetch user.";
    }
    this.loading = false;
  },
  display: function () {
    const p = sceneManager.getCanvas();
    if (!p) return;
    p.background(51);
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();
    if (this.loading) {
      p.text("Loading...", 50, 50);
    } else if (this.error) {
      p.text(`Error: ${this.error}`, 50, 50);
    } else if (this.profileData) {
      console.log("Testing profile data 2: ", this.profileData);
      p.text(`Username: ${this.profileData.username ?? "-"}`, 50, 50);
      p.text(`Display Name: ${this.profileData.display_name ?? "-"}`, 50, 90);
      // Add more fields as needed
    }
    buttons.menu.update(window.innerWidth - 125, 25);
    buttons.getPublicUrl.update(window.innerWidth - 350, 25);
    if (typeof window !== "undefined" && window._publicProfileCopied) {
      const p = sceneManager.getCanvas();
      p.fill(0, 220, 0);
      p.textSize(18);
      p.textAlign(p.RIGHT, p.TOP);
      p.text("Copied!", window.innerWidth - 370, 70);
    }
  },
  buttons: Object.values(buttons),
};

export default publicProfileScene;
