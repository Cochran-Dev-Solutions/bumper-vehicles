# Rendering System

## Overview

The Bumper Vehicles rendering system is built on p5.js for the web client and Skia for the mobile client, providing a unified rendering pipeline that handles 2D graphics, animations, UI elements, and real-time game visualization. The system is designed for high performance and smooth 60 FPS rendering across different platforms.

## Architecture Overview

### Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Rendering Pipeline                      │
├─────────────────────────────────────────────────────────────┤
│  Scene Management         │  Asset Management              │
│  • Scene Stack           │  • Image Loading               │
│  • Layer System          │  • Texture Caching             │
│  • Camera Control        │  • Animation Frames            │
│  • Viewport Management   │  • Resource Pooling            │
└─────────────────────────────────────────────────────────────┘
                              │
                    Rendering Engine
                              │
┌─────────────────────────────────────────────────────────────┐
│  Web Client (p5.js)       │  Mobile Client (Skia)         │
│  • Canvas Rendering       │  • Native 2D Graphics         │
│  • WebGL Support          │  • Hardware Acceleration       │
│  • Image Processing       │  • Custom Shaders             │
│  • Particle Systems       │  • Animation Engine           │
└─────────────────────────────────────────────────────────────┘
```

## Web Client Rendering (p5.js)

### GameRenderer Core

```javascript
// packages/client-logic/src/core/rendering/GameRenderer.js
class GameRenderer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.p5 = null;
    this.config = {
      width: 800,
      height: 600,
      targetFPS: 60,
      enableWebGL: true,
      enableAntialiasing: true,
      ...config,
    };

    // Rendering state
    this.renderingState = {
      currentScene: null,
      camera: { x: 0, y: 0, zoom: 1.0 },
      viewport: { width: this.config.width, height: this.config.height },
      renderLayers: new Map(),
      isRendering: false,
    };

    // Asset management
    this.assetManager = new AssetManager();
    this.textureCache = new Map();
    this.animationCache = new Map();

    // Performance monitoring
    this.performance = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
    };

    // Initialize p5.js
    this.initializeP5();
  }

  // Initialize p5.js instance
  initializeP5() {
    this.p5 = new p5(p => {
      p.setup = () => this.setup(p);
      p.draw = () => this.draw(p);
      p.preload = () => this.preload(p);
    }, this.canvas);
  }

  // p5.js setup
  setup(p) {
    this.p5 = p;

    // Create canvas
    this.canvas = p.createCanvas(this.config.width, this.config.height);

    // Configure rendering
    if (this.config.enableWebGL) {
      p.setAttributes("antialias", this.config.enableAntialiasing);
    }

    // Set frame rate
    p.frameRate(this.config.targetFPS);

    // Initialize rendering layers
    this.initializeRenderLayers();

    // Load assets
    this.loadAssets();
  }

  // p5.js draw loop
  draw(p) {
    const frameStart = performance.now();

    // Clear canvas
    p.clear();

    // Update camera
    this.updateCamera();

    // Render current scene
    if (this.renderingState.currentScene) {
      this.renderScene(p);
    }

    // Render UI overlay
    this.renderUI(p);

    // Update performance metrics
    this.updatePerformanceMetrics(performance.now() - frameStart);
  }

  // Render current scene
  renderScene(p) {
    const scene = this.renderingState.currentScene;

    // Apply camera transform
    p.push();
    p.translate(-this.renderingState.camera.x, -this.renderingState.camera.y);
    p.scale(this.renderingState.camera.zoom);

    // Render background
    this.renderBackground(p, scene);

    // Render game entities
    this.renderEntities(p, scene);

    // Render particles
    this.renderParticles(p, scene);

    // Render effects
    this.renderEffects(p, scene);

    p.pop();
  }

  // Render game entities
  renderEntities(p, scene) {
    scene.entities.forEach(entity => {
      if (entity.isVisible) {
        this.renderEntity(p, entity);
      }
    });
  }

  // Render individual entity
  renderEntity(p, entity) {
    p.push();
    p.translate(entity.position.x, entity.position.y);
    p.rotate(entity.rotation);

    // Get entity sprite
    const sprite = this.getEntitySprite(entity);
    if (sprite) {
      this.renderSprite(p, sprite, entity);
    } else {
      // Fallback rendering
      this.renderFallback(p, entity);
    }

    p.pop();
  }

  // Render sprite
  renderSprite(p, sprite, entity) {
    if (sprite.isAnimated) {
      this.renderAnimatedSprite(p, sprite, entity);
    } else {
      this.renderStaticSprite(p, sprite, entity);
    }
  }

  // Render animated sprite
  renderAnimatedSprite(p, sprite, entity) {
    const animation = sprite.getCurrentAnimation();
    if (animation) {
      const frame = animation.getCurrentFrame();
      if (frame) {
        p.image(
          frame.image,
          -frame.width / 2,
          -frame.height / 2,
          frame.width,
          frame.height
        );
      }
    }
  }

  // Render static sprite
  renderStaticSprite(p, sprite, entity) {
    const image = sprite.getImage();
    if (image) {
      p.image(
        image,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
      );
    }
  }

  // Render particles
  renderParticles(p, scene) {
    scene.particleSystems.forEach(system => {
      system.particles.forEach(particle => {
        this.renderParticle(p, particle);
      });
    });
  }

  // Render individual particle
  renderParticle(p, particle) {
    p.push();
    p.translate(particle.position.x, particle.position.y);
    p.rotate(particle.rotation);

    // Apply particle effects
    p.tint(particle.color);
    p.imageMode(p.CENTER);

    // Render particle sprite
    const particleSprite = this.getParticleSprite(particle.type);
    if (particleSprite) {
      p.image(particleSprite, 0, 0, particle.size, particle.size);
    }

    p.pop();
  }

  // Render UI overlay
  renderUI(p) {
    // Reset transform for UI
    p.push();
    p.translate(0, 0);
    p.scale(1);

    // Render HUD
    this.renderHUD(p);

    // Render menus
    this.renderMenus(p);

    // Render notifications
    this.renderNotifications(p);

    p.pop();
  }

  // Render HUD
  renderHUD(p) {
    const hud = this.renderingState.currentScene?.hud;
    if (hud) {
      // Health bar
      this.renderHealthBar(p, hud.health);

      // Score display
      this.renderScore(p, hud.score);

      // Minimap
      this.renderMinimap(p, hud.minimap);

      // Powerup indicators
      this.renderPowerupIndicators(p, hud.powerups);
    }
  }

  // Camera management
  updateCamera() {
    const target = this.getCameraTarget();
    if (target) {
      // Smooth camera follow
      const lerpFactor = 0.1;
      this.renderingState.camera.x = p.lerp(
        this.renderingState.camera.x,
        target.x - this.renderingState.viewport.width / 2,
        lerpFactor
      );
      this.renderingState.camera.y = p.lerp(
        this.renderingState.camera.y,
        target.y - this.renderingState.viewport.height / 2,
        lerpFactor
      );
    }
  }

  // Get camera target (usually local player)
  getCameraTarget() {
    const localPlayer = this.getLocalPlayer();
    return localPlayer ? localPlayer.position : null;
  }

  // Performance monitoring
  updatePerformanceMetrics(frameTime) {
    this.performance.frameTime = frameTime;
    this.performance.fps = 1000 / frameTime;
    this.performance.drawCalls = this.renderingState.drawCalls;

    // Reset draw calls counter
    this.renderingState.drawCalls = 0;
  }

  // Get performance stats
  getPerformanceStats() {
    return { ...this.performance };
  }
}
```

### Asset Management

```javascript
// packages/client-logic/src/core/rendering/AssetManager.js
class AssetManager {
  constructor() {
    this.images = new Map();
    this.animations = new Map();
    this.sounds = new Map();
    this.fonts = new Map();

    this.loadingQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;

    this.assetConfig = {
      imagePath: "/public/Images/",
      soundPath: "/public/Sounds/",
      fontPath: "/public/Fonts/",
    };
  }

  // Load all game assets
  async loadAssets() {
    const assetList = this.getAssetList();
    this.totalAssets = assetList.length;

    // Create loading promises
    const loadPromises = assetList.map(asset => this.loadAsset(asset));

    // Load all assets
    await Promise.all(loadPromises);

    console.log(`Loaded ${this.loadedAssets} assets`);
  }

  // Load individual asset
  async loadAsset(assetConfig) {
    try {
      switch (assetConfig.type) {
        case "image":
          await this.loadImage(assetConfig);
          break;
        case "animation":
          await this.loadAnimation(assetConfig);
          break;
        case "sound":
          await this.loadSound(assetConfig);
          break;
        case "font":
          await this.loadFont(assetConfig);
          break;
      }

      this.loadedAssets++;
    } catch (error) {
      console.error(`Failed to load asset: ${assetConfig.name}`, error);
    }
  }

  // Load image asset
  async loadImage(config) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(config.name, img);
        resolve(img);
      };
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${config.path}`));
      img.src = this.assetConfig.imagePath + config.path;
    });
  }

  // Load animation asset
  async loadAnimation(config) {
    const frames = [];

    for (let i = 1; i <= config.frameCount; i++) {
      const framePath = config.path.replace(
        "{frame}",
        i.toString().padStart(2, "0")
      );
      const frame = await this.loadImage({
        name: `${config.name}_frame_${i}`,
        path: framePath,
      });
      frames.push(frame);
    }

    const animation = {
      name: config.name,
      frames: frames,
      frameRate: config.frameRate || 10,
      loop: config.loop !== false,
    };

    this.animations.set(config.name, animation);
    return animation;
  }

  // Load sound asset
  async loadSound(config) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.sounds.set(config.name, audio);
        resolve(audio);
      };
      audio.onerror = () =>
        reject(new Error(`Failed to load sound: ${config.path}`));
      audio.src = this.assetConfig.soundPath + config.path;
    });
  }

  // Get asset list
  getAssetList() {
    return [
      // Character sprites
      {
        name: "penguin_idle",
        type: "animation",
        path: "Penguin/penguin_walk{frame}.png",
        frameCount: 4,
        frameRate: 8,
      },
      {
        name: "penguin_walk",
        type: "animation",
        path: "Penguin/penguin_walk{frame}.png",
        frameCount: 4,
        frameRate: 8,
      },
      {
        name: "penguin_jump",
        type: "animation",
        path: "Penguin/penguin_jump{frame}.png",
        frameCount: 3,
        frameRate: 12,
      },
      {
        name: "penguin_die",
        type: "animation",
        path: "Penguin/penguin_die{frame}.png",
        frameCount: 4,
        frameRate: 6,
        loop: false,
      },

      // Alligator sprites
      {
        name: "alligator_idle",
        type: "animation",
        path: "Ari_Alligator/frame_{frame}.png",
        frameCount: 15,
        frameRate: 10,
      },
      {
        name: "alligator_walk",
        type: "animation",
        path: "Ari_Alligator/frame_{frame}.png",
        frameCount: 15,
        frameRate: 10,
      },

      // Powerups
      { name: "powerup_health", type: "image", path: "Powerups/heart.png" },
      { name: "powerup_speed", type: "image", path: "Powerups/biggy.png" },
      { name: "powerup_magnet", type: "image", path: "Powerups/magnet.png" },
      { name: "powerup_mine", type: "image", path: "Powerups/mine.png" },
      { name: "powerup_missile", type: "image", path: "Powerups/missile.png" },

      // UI elements
      { name: "ui_button", type: "image", path: "Button_Icons/button_bg.png" },
      { name: "ui_health_bar", type: "image", path: "UI/health_bar.png" },
      { name: "ui_score_bg", type: "image", path: "UI/score_background.png" },

      // Environment
      { name: "block", type: "image", path: "Block/block.png" },
      { name: "cloud", type: "image", path: "MapScene/Islands/cloud.png" },
      {
        name: "island",
        type: "image",
        path: "MapScene/Islands/example_island.png",
      },

      // Sounds
      { name: "sound_collision", type: "sound", path: "collision.mp3" },
      { name: "sound_powerup", type: "sound", path: "powerup.mp3" },
      { name: "sound_victory", type: "sound", path: "victory.mp3" },
      { name: "sound_defeat", type: "sound", path: "defeat.mp3" },

      // Music
      { name: "music_background", type: "sound", path: "background_music.mp3" },
      { name: "music_menu", type: "sound", path: "menu_music.mp3" },
    ];
  }

  // Get image by name
  getImage(name) {
    return this.images.get(name);
  }

  // Get animation by name
  getAnimation(name) {
    return this.animations.get(name);
  }

  // Get sound by name
  getSound(name) {
    return this.sounds.get(name);
  }

  // Get font by name
  getFont(name) {
    return this.fonts.get(name);
  }

  // Get loading progress
  getLoadingProgress() {
    return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1;
  }

  // Check if all assets are loaded
  isLoaded() {
    return this.loadedAssets === this.totalAssets;
  }
}
```

### Animation System

```javascript
// packages/client-logic/src/core/rendering/AnimatedSprite.js
class AnimatedSprite {
  constructor(animation, config = {}) {
    this.animation = animation;
    this.config = {
      frameRate: animation.frameRate || 10,
      loop: animation.loop !== false,
      ...config,
    };

    this.currentFrame = 0;
    this.frameTime = 0;
    this.frameDuration = 1000 / this.config.frameRate;
    this.isPlaying = true;
    this.isFinished = false;
  }

  // Update animation
  update(deltaTime) {
    if (!this.isPlaying || this.isFinished) {
      return;
    }

    this.frameTime += deltaTime;

    if (this.frameTime >= this.frameDuration) {
      this.frameTime = 0;
      this.currentFrame++;

      if (this.currentFrame >= this.animation.frames.length) {
        if (this.config.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.animation.frames.length - 1;
          this.isFinished = true;
          this.isPlaying = false;
        }
      }
    }
  }

  // Get current frame
  getCurrentFrame() {
    return this.animation.frames[this.currentFrame];
  }

  // Play animation
  play() {
    this.isPlaying = true;
    this.isFinished = false;
  }

  // Pause animation
  pause() {
    this.isPlaying = false;
  }

  // Stop animation
  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.frameTime = 0;
    this.isFinished = false;
  }

  // Reset animation
  reset() {
    this.currentFrame = 0;
    this.frameTime = 0;
    this.isFinished = false;
  }

  // Set frame rate
  setFrameRate(frameRate) {
    this.config.frameRate = frameRate;
    this.frameDuration = 1000 / frameRate;
  }

  // Check if animation is finished
  isAnimationFinished() {
    return this.isFinished;
  }
}
```

## Mobile Client Rendering (Skia)

### Skia Renderer

```javascript
// apps/mobile-client/src/rendering/SkiaRenderer.js
import {
  Canvas,
  Image,
  Paint,
  Path,
  Rect,
  RRect,
} from "@shopify/react-native-skia";

class SkiaRenderer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.config = {
      width: 800,
      height: 600,
      enableHardwareAcceleration: true,
      ...config,
    };

    // Skia objects
    this.paint = new Paint();
    this.path = new Path();

    // Rendering state
    this.renderingState = {
      currentScene: null,
      camera: { x: 0, y: 0, zoom: 1.0 },
      viewport: { width: this.config.width, height: this.config.height },
    };

    // Asset management
    this.assetManager = new SkiaAssetManager();

    // Performance monitoring
    this.performance = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
    };
  }

  // Main render method
  render() {
    const frameStart = performance.now();

    // Clear canvas
    this.canvas.clear();

    // Update camera
    this.updateCamera();

    // Render current scene
    if (this.renderingState.currentScene) {
      this.renderScene();
    }

    // Render UI overlay
    this.renderUI();

    // Update performance metrics
    this.updatePerformanceMetrics(performance.now() - frameStart);
  }

  // Render scene
  renderScene() {
    const scene = this.renderingState.currentScene;

    // Save canvas state
    this.canvas.save();

    // Apply camera transform
    this.canvas.translate(
      -this.renderingState.camera.x,
      -this.renderingState.camera.y
    );
    this.canvas.scale(this.renderingState.camera.zoom);

    // Render background
    this.renderBackground(scene);

    // Render game entities
    this.renderEntities(scene);

    // Render particles
    this.renderParticles(scene);

    // Render effects
    this.renderEffects(scene);

    // Restore canvas state
    this.canvas.restore();
  }

  // Render game entities
  renderEntities(scene) {
    scene.entities.forEach(entity => {
      if (entity.isVisible) {
        this.renderEntity(entity);
      }
    });
  }

  // Render individual entity
  renderEntity(entity) {
    this.canvas.save();
    this.canvas.translate(entity.position.x, entity.position.y);
    this.canvas.rotate(entity.rotation);

    // Get entity sprite
    const sprite = this.getEntitySprite(entity);
    if (sprite) {
      this.renderSprite(sprite, entity);
    } else {
      // Fallback rendering
      this.renderFallback(entity);
    }

    this.canvas.restore();
  }

  // Render sprite
  renderSprite(sprite, entity) {
    if (sprite.isAnimated) {
      this.renderAnimatedSprite(sprite, entity);
    } else {
      this.renderStaticSprite(sprite, entity);
    }
  }

  // Render animated sprite
  renderAnimatedSprite(sprite, entity) {
    const animation = sprite.getCurrentAnimation();
    if (animation) {
      const frame = animation.getCurrentFrame();
      if (frame) {
        const rect = Rect.makeXYWH(
          -frame.width / 2,
          -frame.height / 2,
          frame.width,
          frame.height
        );

        this.canvas.drawImageRect(frame.image, rect, this.paint);
      }
    }
  }

  // Render static sprite
  renderStaticSprite(sprite, entity) {
    const image = sprite.getImage();
    if (image) {
      const rect = Rect.makeXYWH(
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
      );

      this.canvas.drawImageRect(image, rect, this.paint);
    }
  }

  // Render particles
  renderParticles(scene) {
    scene.particleSystems.forEach(system => {
      system.particles.forEach(particle => {
        this.renderParticle(particle);
      });
    });
  }

  // Render individual particle
  renderParticle(particle) {
    this.canvas.save();
    this.canvas.translate(particle.position.x, particle.position.y);
    this.canvas.rotate(particle.rotation);

    // Set particle color
    this.paint.setColor(particle.color);

    // Render particle sprite or shape
    const particleSprite = this.getParticleSprite(particle.type);
    if (particleSprite) {
      const rect = Rect.makeXYWH(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size
      );

      this.canvas.drawImageRect(particleSprite, rect, this.paint);
    } else {
      // Render as circle
      this.canvas.drawCircle(0, 0, particle.size / 2, this.paint);
    }

    this.canvas.restore();
  }

  // Render UI overlay
  renderUI() {
    // Reset transform for UI
    this.canvas.save();
    this.canvas.translate(0, 0);
    this.canvas.scale(1);

    // Render HUD
    this.renderHUD();

    // Render menus
    this.renderMenus();

    // Render notifications
    this.renderNotifications();

    this.canvas.restore();
  }

  // Render HUD
  renderHUD() {
    const hud = this.renderingState.currentScene?.hud;
    if (hud) {
      // Health bar
      this.renderHealthBar(hud.health);

      // Score display
      this.renderScore(hud.score);

      // Minimap
      this.renderMinimap(hud.minimap);

      // Powerup indicators
      this.renderPowerupIndicators(hud.powerups);
    }
  }

  // Render health bar
  renderHealthBar(health) {
    const barWidth = 200;
    const barHeight = 20;
    const x = 20;
    const y = 20;

    // Background
    this.paint.setColor("#333333");
    const backgroundRect = Rect.makeXYWH(x, y, barWidth, barHeight);
    this.canvas.drawRect(backgroundRect, this.paint);

    // Health fill
    const healthPercent = health.current / health.max;
    this.paint.setColor(
      healthPercent > 0.5
        ? "#00FF00"
        : healthPercent > 0.25
        ? "#FFFF00"
        : "#FF0000"
    );
    const healthRect = Rect.makeXYWH(x, y, barWidth * healthPercent, barHeight);
    this.canvas.drawRect(healthRect, this.paint);

    // Border
    this.paint.setColor("#FFFFFF");
    this.paint.setStyle("stroke");
    this.canvas.drawRect(backgroundRect, this.paint);
  }

  // Render score
  renderScore(score) {
    this.paint.setColor("#FFFFFF");
    this.paint.setTextSize(24);
    this.canvas.drawText(`Score: ${score}`, 20, 60, this.paint);
  }

  // Camera management
  updateCamera() {
    const target = this.getCameraTarget();
    if (target) {
      // Smooth camera follow
      const lerpFactor = 0.1;
      this.renderingState.camera.x = this.lerp(
        this.renderingState.camera.x,
        target.x - this.renderingState.viewport.width / 2,
        lerpFactor
      );
      this.renderingState.camera.y = this.lerp(
        this.renderingState.camera.y,
        target.y - this.renderingState.viewport.height / 2,
        lerpFactor
      );
    }
  }

  // Linear interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Get camera target
  getCameraTarget() {
    const localPlayer = this.getLocalPlayer();
    return localPlayer ? localPlayer.position : null;
  }

  // Performance monitoring
  updatePerformanceMetrics(frameTime) {
    this.performance.frameTime = frameTime;
    this.performance.fps = 1000 / frameTime;
  }

  // Get performance stats
  getPerformanceStats() {
    return { ...this.performance };
  }
}
```

### Skia Asset Manager

```javascript
// apps/mobile-client/src/rendering/SkiaAssetManager.js
import { Image } from "@shopify/react-native-skia";

class SkiaAssetManager {
  constructor() {
    this.images = new Map();
    this.animations = new Map();
    this.sounds = new Map();

    this.loadingQueue = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
  }

  // Load image asset
  async loadImage(config) {
    try {
      const image = await Image.fromUri(config.path);
      this.images.set(config.name, image);
      return image;
    } catch (error) {
      console.error(`Failed to load image: ${config.path}`, error);
      throw error;
    }
  }

  // Load animation asset
  async loadAnimation(config) {
    const frames = [];

    for (let i = 1; i <= config.frameCount; i++) {
      const framePath = config.path.replace(
        "{frame}",
        i.toString().padStart(2, "0")
      );
      const frame = await this.loadImage({
        name: `${config.name}_frame_${i}`,
        path: framePath,
      });
      frames.push(frame);
    }

    const animation = {
      name: config.name,
      frames: frames,
      frameRate: config.frameRate || 10,
      loop: config.loop !== false,
    };

    this.animations.set(config.name, animation);
    return animation;
  }

  // Get image by name
  getImage(name) {
    return this.images.get(name);
  }

  // Get animation by name
  getAnimation(name) {
    return this.animations.get(name);
  }

  // Get sound by name
  getSound(name) {
    return this.sounds.get(name);
  }
}
```

## Performance Optimization

### Rendering Optimization

```javascript
// packages/client-logic/src/core/rendering/RenderingOptimizer.js
class RenderingOptimizer {
  constructor(renderer) {
    this.renderer = renderer;
    this.optimizationConfig = {
      enableFrustumCulling: true,
      enableOcclusionCulling: true,
      enableLOD: true,
      maxDrawCalls: 1000,
      maxTriangles: 10000,
    };

    this.stats = {
      culledEntities: 0,
      visibleEntities: 0,
      drawCalls: 0,
      triangles: 0,
    };
  }

  // Frustum culling
  performFrustumCulling(entities) {
    const visibleEntities = [];
    const frustum = this.calculateFrustum();

    entities.forEach(entity => {
      if (this.isEntityInFrustum(entity, frustum)) {
        visibleEntities.push(entity);
        this.stats.visibleEntities++;
      } else {
        this.stats.culledEntities++;
      }
    });

    return visibleEntities;
  }

  // Calculate view frustum
  calculateFrustum() {
    const camera = this.renderer.renderingState.camera;
    const viewport = this.renderer.renderingState.viewport;

    const left = camera.x;
    const right = camera.x + viewport.width / camera.zoom;
    const top = camera.y;
    const bottom = camera.y + viewport.height / camera.zoom;

    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }

  // Check if entity is in frustum
  isEntityInFrustum(entity, frustum) {
    const entityBounds = entity.getBoundingBox();

    return !(
      entityBounds.x + entityBounds.width < frustum.left ||
      entityBounds.x > frustum.right ||
      entityBounds.y + entityBounds.height < frustum.top ||
      entityBounds.y > frustum.bottom
    );
  }

  // Level of Detail (LOD)
  applyLOD(entity, distance) {
    if (!this.optimizationConfig.enableLOD) {
      return entity;
    }

    // Adjust detail level based on distance
    if (distance > 500) {
      entity.lodLevel = "low";
    } else if (distance > 200) {
      entity.lodLevel = "medium";
    } else {
      entity.lodLevel = "high";
    }

    return entity;
  }

  // Batch rendering
  batchRenderCalls(entities) {
    const batches = new Map();

    entities.forEach(entity => {
      const batchKey = this.getBatchKey(entity);
      if (!batches.has(batchKey)) {
        batches.set(batchKey, []);
      }
      batches.get(batchKey).push(entity);
    });

    return batches;
  }

  // Get batch key for entity
  getBatchKey(entity) {
    return `${entity.spriteName}_${entity.materialName}`;
  }

  // Update optimization stats
  updateStats() {
    this.stats.drawCalls = this.renderer.performance.drawCalls;
    this.stats.triangles = this.renderer.performance.triangles;
  }

  // Get optimization stats
  getOptimizationStats() {
    return { ...this.stats };
  }
}
```

### Memory Management

```javascript
// packages/client-logic/src/core/rendering/MemoryManager.js
class MemoryManager {
  constructor() {
    this.memoryPools = new Map();
    this.allocationStats = {
      totalAllocated: 0,
      totalFreed: 0,
      currentUsage: 0,
    };
  }

  // Create memory pool
  createPool(name, size) {
    const pool = {
      name: name,
      size: size,
      allocated: 0,
      free: size,
      objects: new Set(),
    };

    this.memoryPools.set(name, pool);
    return pool;
  }

  // Allocate from pool
  allocate(poolName, size) {
    const pool = this.memoryPools.get(poolName);
    if (!pool) {
      throw new Error(`Pool ${poolName} not found`);
    }

    if (pool.free < size) {
      // Pool is full, need to free some memory
      this.cleanupPool(poolName);
    }

    if (pool.free >= size) {
      pool.allocated += size;
      pool.free -= size;
      this.allocationStats.totalAllocated += size;
      this.allocationStats.currentUsage += size;

      return true;
    }

    return false;
  }

  // Free memory from pool
  free(poolName, size) {
    const pool = this.memoryPools.get(poolName);
    if (!pool) {
      return false;
    }

    pool.allocated = Math.max(0, pool.allocated - size);
    pool.free = Math.min(pool.size, pool.free + size);
    this.allocationStats.totalFreed += size;
    this.allocationStats.currentUsage = Math.max(
      0,
      this.allocationStats.currentUsage - size
    );

    return true;
  }

  // Cleanup pool
  cleanupPool(poolName) {
    const pool = this.memoryPools.get(poolName);
    if (!pool) {
      return;
    }

    // Free oldest objects
    const objectsToFree = Math.floor(pool.allocated * 0.3); // Free 30%
    let freed = 0;

    for (const obj of pool.objects) {
      if (freed >= objectsToFree) break;

      if (obj.canBeFreed && obj.free()) {
        freed += obj.size;
        pool.objects.delete(obj);
      }
    }

    pool.allocated = Math.max(0, pool.allocated - freed);
    pool.free = Math.min(pool.size, pool.free + freed);
  }

  // Get memory stats
  getMemoryStats() {
    const poolStats = {};
    this.memoryPools.forEach((pool, name) => {
      poolStats[name] = {
        allocated: pool.allocated,
        free: pool.free,
        usage: pool.allocated / pool.size,
      };
    });

    return {
      pools: poolStats,
      allocation: { ...this.allocationStats },
    };
  }
}
```

## Rendering Configuration

### Default Rendering Settings

```javascript
// packages/client-logic/src/core/rendering/config.js
const RENDERING_CONFIG = {
  // Web client settings
  web: {
    canvas: {
      width: 800,
      height: 600,
      enableWebGL: true,
      enableAntialiasing: true,
    },
    performance: {
      targetFPS: 60,
      maxDrawCalls: 1000,
      maxTriangles: 10000,
    },
    optimization: {
      enableFrustumCulling: true,
      enableOcclusionCulling: true,
      enableLOD: true,
      batchSize: 100,
    },
  },

  // Mobile client settings
  mobile: {
    canvas: {
      width: 400,
      height: 600,
      enableHardwareAcceleration: true,
    },
    performance: {
      targetFPS: 60,
      maxDrawCalls: 500,
      maxTriangles: 5000,
    },
    optimization: {
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      enableLOD: true,
      batchSize: 50,
    },
  },

  // Asset settings
  assets: {
    imagePath: "/public/Images/",
    soundPath: "/public/Sounds/",
    fontPath: "/public/Fonts/",
    preloadAll: false,
    lazyLoading: true,
  },

  // Camera settings
  camera: {
    followSmoothness: 0.1,
    maxZoom: 2.0,
    minZoom: 0.5,
    defaultZoom: 1.0,
  },

  // UI settings
  ui: {
    scaleMode: "fit",
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    hudOpacity: 0.8,
    menuOpacity: 0.9,
  },
};

module.exports = RENDERING_CONFIG;
```

This comprehensive rendering system provides efficient 2D graphics rendering for both web and mobile platforms, with advanced features like animation support, particle systems, and performance optimization techniques.
