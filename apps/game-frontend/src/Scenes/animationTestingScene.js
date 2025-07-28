import { AnimatedSprite } from "@bv-frontend-logic"
import { p5Images } from "../render-tools/images.js";

const animationTestingScene = {
  name: "Animation Testing Scene",
  sprite: null,
  loaded: false,

  init: async function () {
    // Use centralized animation frames
    this.images = p5Images["ari_alligator_frames"];
    this.sprite = new AnimatedSprite({ images: this.images });
    this.sprite.setAnimationSpeed(20); // 8 FPS
    this.loaded = true;
  },

  display: function () {
    this.p.background(30, 30, 40);
    if (this.loaded && this.sprite) {
      // Center and enlarge
      const w = 120;
      const h = 100;
      const x = (this.p.width - w) / 2;
      const y = (this.p.height - h) / 2;
      this.sprite.display(this.p, x, y, w, h);
    } else {
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Loading animation...", this.p.width / 2, this.p.height / 2);
    }
  },
  buttons: [],
};

export default animationTestingScene;
