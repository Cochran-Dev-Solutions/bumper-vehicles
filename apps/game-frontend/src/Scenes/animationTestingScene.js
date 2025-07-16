import { AnimatedSprite } from "../utils/AnimatedSprite.js";

const animationTestingScene = {
  name: "Animation Testing Scene",
  sprite: null,
  images: [],
  loaded: false,

  init: async function () {
    // Load images 1-15
    const p = this.p;
    const loadImageAsync = (src) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const p5Image = p.createImage(img.width, img.height);
          p5Image.drawingContext.drawImage(img, 0, 0);
          resolve(p5Image);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = "/Images/Ari_Alligator/frame_" + src + ".png";
      });
    };
    const promises = [];
    for (let i = 1; i <= 15; i++) {
      promises.push(loadImageAsync(i));
    }
    this.images = await Promise.all(promises);
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
