# Scene Management 🎭

This document provides a comprehensive overview of the scene management system in Bumper Vehicles, including the SceneManager class, routing, transitions, and UI/UX design patterns.

## 🏗️ Architecture Overview

The scene management system provides a **state-driven UI architecture** that handles:

- **Scene Transitions** - Smooth navigation between game states
- **Input Management** - Centralized handling of user interactions
- **Rendering Pipeline** - Coordinated visual updates
- **State Synchronization** - UI state management across components

## 🎯 Core Components

### SceneManager Class (`packages/client-logic/src/core/event-management/SceneManager.js`)

The central orchestrator for all scene-related operations.

#### Key Responsibilities

```javascript
class SceneManager {
  constructor() {
    this.currentScene = null;
    this.scenes = new Map();
    this.canvas = null;
    this.loadOperations = [];
    this.isLoading = false;
  }

  // Scene registration and management
  addScene(name, scene) {
    /* Register new scene */
  }
  switchScene(name, data) {
    /* Transition to new scene */
  }
  getCurrentScene() {
    /* Get active scene */
  }

  // Loading and initialization
  addLoadOperation(operation) {
    /* Queue loading operations */
  }
  executeLoadOperations() {
    /* Process loading queue */
  }

  // Canvas and rendering
  attachCanvas(p5Instance) {
    /* Connect p5.js canvas */
  }
  update() {
    /* Main render loop */
  }
  sceneCleanup() {
    /* Clean up scene resources */
  }
}
```

#### Scene Registration

```javascript
// Register scenes with the manager
sceneManager.addScene("menu", menuScene);
sceneManager.addScene("game", gameScene);
sceneManager.addScene("garage", garageScene);
sceneManager.addScene("map", mapScene);
sceneManager.addScene("login", loginScene);
sceneManager.addScene("signup", signupScene);
sceneManager.addScene("profile", profileScene);
```

### Scene Structure

Each scene follows a consistent interface:

```javascript
const sceneTemplate = {
  // Scene lifecycle methods
  init(data) {
    // Initialize scene with data
    this.data = data;
    this.setup();
  },

  setup() {
    // Setup scene-specific components
    this.createUI();
    this.bindEvents();
  },

  update() {
    // Update scene logic (called every frame)
    this.updateAnimations();
    this.checkInputs();
  },

  render(p5) {
    // Render scene visuals
    this.renderBackground(p5);
    this.renderUI(p5);
    this.renderAnimations(p5);
  },

  cleanup() {
    // Clean up scene resources
    this.removeEventListeners();
    this.clearAnimations();
  },

  // Event handlers
  onKeyPress(key) {
    // Handle keyboard input
  },

  onMouseClick(x, y) {
    // Handle mouse clicks
  },

  onMouseMove(x, y) {
    // Handle mouse movement
  },
};
```

## 🎮 Scene Types

### 1. Menu Scene (`apps/web-client/src/Scenes/menuScene.js`)

The main menu interface with navigation options.

#### Features

- **Game Modes** - Race, Battle, Training
- **Player Profile** - Access to user settings
- **Settings** - Audio, graphics, controls
- **Community** - Discord, social links

#### Implementation

```javascript
const menuScene = {
  init(data) {
    this.buttons = [
      { text: "Play Game", action: () => this.switchToGame() },
      { text: "Garage", action: () => this.switchToGarage() },
      { text: "Map", action: () => this.switchToMap() },
      { text: "Profile", action: () => this.switchToProfile() },
    ];
  },

  render(p5) {
    // Render background
    p5.background(0, 0, 50);

    // Render title
    p5.fill(255);
    p5.textSize(48);
    p5.textAlign(p5.CENTER);
    p5.text("Bumper Vehicles", p5.width / 2, 100);

    // Render buttons
    this.buttons.forEach((button, index) => {
      this.renderButton(p5, button, 200 + index * 80);
    });
  },

  onMouseClick(x, y) {
    // Check button clicks
    this.buttons.forEach(button => {
      if (this.isButtonClicked(button, x, y)) {
        button.action();
      }
    });
  },
};
```

### 2. Game Scene (`apps/web-client/src/Scenes/gameScene.js`)

The main gameplay interface with real-time rendering.

#### Features

- **Game Renderer** - p5.js canvas rendering
- **UI Overlay** - Lives, boost, power-ups
- **Camera Control** - Dynamic viewport management
- **Input Handling** - Real-time player controls

#### Implementation

```javascript
const gameScene = {
  init(data) {
    this.gameRenderer = new GameRenderer({
      p: this.p5Instance,
      gameInfo: data.gameInfo,
    });

    this.ui = {
      lives: 3,
      boost: 100,
      powerups: [],
    };
  },

  async setup() {
    // Initialize game renderer
    await this.gameRenderer.setup(this.p5Instance, this.gameInfo);

    // Setup WebSocket connection
    this.socket = io(API_URL);
    this.setupSocketEvents();
  },

  update() {
    // Update game renderer
    this.gameRenderer.update();

    // Update UI elements
    this.updateUI();
  },

  render(p5) {
    // Render game world
    this.gameRenderer.render(p5);

    // Render UI overlay
    this.renderUI(p5);
  },

  onKeyPress(key) {
    // Handle player input
    this.gameRenderer.handleInput(key);
  },
};
```

### 3. Garage Scene (`apps/web-client/src/Scenes/garageScene.js`)

Vehicle customization and character selection.

#### Features

- **Character Selection** - Choose vehicle/character
- **Customization** - Colors, accessories, upgrades
- **Preview System** - 3D-like character preview
- **Stats Display** - Vehicle performance metrics

#### Implementation

```javascript
const garageScene = {
  init(data) {
    this.characters = data.characters || [];
    this.selectedCharacter = 0;
    this.customization = {
      color: "blue",
      accessories: [],
      upgrades: [],
    };
  },

  render(p5) {
    // Render garage background
    this.renderGarageBackground(p5);

    // Render character preview
    this.renderCharacterPreview(p5);

    // Render customization options
    this.renderCustomizationUI(p5);

    // Render character stats
    this.renderStats(p5);
  },

  renderCharacterPreview(p5) {
    const character = this.characters[this.selectedCharacter];
    const garageCharacter = new GarageCharacter(character);
    garageCharacter.render(p5);
  },

  onMouseClick(x, y) {
    // Handle character selection
    if (this.isCharacterButtonClicked(x, y)) {
      this.selectCharacter(this.getCharacterIndex(x, y));
    }

    // Handle customization clicks
    if (this.isCustomizationButtonClicked(x, y)) {
      this.openCustomizationMenu();
    }
  },
};
```

### 4. Map Scene (`apps/web-client/src/Scenes/mapScene.js`)

Map selection and level browsing.

#### Features

- **Map Grid** - Visual map selection interface
- **Map Preview** - Thumbnail and description
- **Difficulty Levels** - Easy, medium, hard
- **Unlock System** - Progressive map unlocking

#### Implementation

```javascript
const mapScene = {
  init(data) {
    this.maps = data.maps || [];
    this.selectedMap = 0;
    this.camera = new MapCamera();
  },

  render(p5) {
    // Render map grid
    this.renderMapGrid(p5);

    // Render selected map preview
    this.renderMapPreview(p5);

    // Render map information
    this.renderMapInfo(p5);
  },

  renderMapGrid(p5) {
    this.maps.forEach((map, index) => {
      const x = (index % 3) * 200 + 100;
      const y = Math.floor(index / 3) * 150 + 100;

      this.renderMapTile(p5, map, x, y, index === this.selectedMap);
    });
  },

  onMouseClick(x, y) {
    // Handle map selection
    const mapIndex = this.getMapIndexAtPosition(x, y);
    if (mapIndex !== -1) {
      this.selectMap(mapIndex);
    }

    // Handle play button
    if (this.isPlayButtonClicked(x, y)) {
      this.startGame();
    }
  },
};
```

## 🔄 Scene Transitions

### Transition System

The scene manager handles smooth transitions between scenes:

```javascript
class SceneManager {
  switchScene(name, data = {}) {
    // Clean up current scene
    if (this.currentScene) {
      this.currentScene.cleanup();
    }

    // Get new scene
    const newScene = this.scenes.get(name);
    if (!newScene) {
      console.error(`Scene '${name}' not found`);
      return;
    }

    // Initialize new scene
    newScene.init(data);

    // Update current scene
    this.currentScene = newScene;

    // Execute any loading operations
    this.executeLoadOperations();
  }
}
```

### Transition Types

#### 1. Instant Transitions

```javascript
// Immediate scene switch
sceneManager.switchScene("menu");
```

#### 2. Data-Passing Transitions

```javascript
// Pass data to new scene
sceneManager.switchScene("game", {
  gameType: "race",
  mapName: "island_circuit",
  players: ["player1", "player2"],
});
```

#### 3. Loading Transitions

```javascript
// Scene with loading operations
sceneManager.addLoadOperation({
  type: "image",
  path: "assets/characters/penguin.png",
  operation: image => this.setCharacterImage(image),
});

sceneManager.switchScene("garage");
```

## 🎨 Rendering Pipeline

### Canvas Management

```javascript
class SceneManager {
  attachCanvas(p5Instance) {
    this.canvas = p5Instance;
    this.p5 = p5Instance;
  }

  update() {
    if (!this.currentScene || !this.canvas) return;

    // Update scene logic
    this.currentScene.update();

    // Render scene
    this.currentScene.render(this.canvas);
  }
}
```

### Rendering Layers

The rendering system uses multiple layers for proper visual hierarchy:

```javascript
const renderLayers = {
  BACKGROUND: 0, // Background elements
  GAME_WORLD: 1, // Game entities and objects
  UI_BACKGROUND: 2, // UI background elements
  UI_FOREGROUND: 3, // UI buttons and text
  OVERLAY: 4, // Loading screens, notifications
};
```

## 🎮 Input Management

### Centralized Input Handling

```javascript
class SceneManager {
  handleKeyPress(key) {
    if (this.currentScene && this.currentScene.onKeyPress) {
      this.currentScene.onKeyPress(key);
    }
  }

  handleMouseClick(x, y) {
    if (this.currentScene && this.currentScene.onMouseClick) {
      this.currentScene.onMouseClick(x, y);
    }
  }

  handleMouseMove(x, y) {
    if (this.currentScene && this.currentScene.onMouseMove) {
      this.currentScene.onMouseMove(x, y);
    }
  }
}
```

### Input Abstraction

The system provides platform-agnostic input handling:

```javascript
// Keyboard input mapping
const keyMappings = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  Space: "action",
  Enter: "confirm",
};

// Mouse input abstraction
const mouseInput = {
  position: { x: 0, y: 0 },
  isPressed: false,
  isDragging: false,
};
```

## 🎯 UI Components

### Button System

```javascript
class Button {
  constructor(config) {
    this.text = config.text;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || 200;
    this.height = config.height || 50;
    this.action = config.action;
    this.style = config.style || {};
  }

  render(p5) {
    // Render button background
    p5.fill(this.style.backgroundColor || 100);
    p5.rect(this.x, this.y, this.width, this.height);

    // Render button text
    p5.fill(this.style.textColor || 255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(this.style.textSize || 16);
    p5.text(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }

  isClicked(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}
```

### Modal System

```javascript
class Modal {
  constructor(config) {
    this.title = config.title;
    this.content = config.content;
    this.buttons = config.buttons || [];
    this.isVisible = false;
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  render(p5) {
    if (!this.isVisible) return;

    // Render modal overlay
    p5.fill(0, 0, 0, 150);
    p5.rect(0, 0, p5.width, p5.height);

    // Render modal content
    this.renderContent(p5);
  }
}
```

## 🔄 State Management

### Scene State

Each scene maintains its own state:

```javascript
const sceneState = {
  // UI state
  ui: {
    selectedTab: 0,
    isMenuOpen: false,
    notifications: [],
  },

  // Game state
  game: {
    score: 0,
    lives: 3,
    powerups: [],
  },

  // Animation state
  animations: {
    fadeIn: 0,
    slideIn: 0,
    particleEffects: [],
  },
};
```

### Global State

The scene manager maintains global application state:

```javascript
class SceneManager {
  constructor() {
    this.globalState = {
      user: null,
      settings: {},
      gameProgress: {},
      notifications: [],
    };
  }

  updateGlobalState(newState) {
    this.globalState = { ...this.globalState, ...newState };
    this.notifyScenesOfStateChange();
  }
}
```

## 🎨 Visual Design

### Color Scheme

```javascript
const colorScheme = {
  primary: "#4A90E2", // Blue
  secondary: "#F5A623", // Orange
  accent: "#7ED321", // Green
  background: "#2C3E50", // Dark blue-gray
  text: "#FFFFFF", // White
  textSecondary: "#BDC3C7", // Light gray
};
```

### Typography

```javascript
const typography = {
  title: {
    font: "Arial, sans-serif",
    size: 48,
    weight: "bold",
  },
  heading: {
    font: "Arial, sans-serif",
    size: 24,
    weight: "bold",
  },
  body: {
    font: "Arial, sans-serif",
    size: 16,
    weight: "normal",
  },
  button: {
    font: "Arial, sans-serif",
    size: 14,
    weight: "bold",
  },
};
```

### Animation System

```javascript
class Animation {
  constructor(config) {
    this.duration = config.duration || 1000;
    this.easing = config.easing || "easeInOut";
    this.startValue = config.startValue;
    this.endValue = config.endValue;
    this.currentValue = this.startValue;
    this.startTime = Date.now();
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    this.currentValue = this.interpolate(
      this.startValue,
      this.endValue,
      this.ease(progress)
    );

    return progress >= 1;
  }

  ease(progress) {
    // Easing functions
    switch (this.easing) {
      case "easeInOut":
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case "easeIn":
        return progress * progress;
      case "easeOut":
        return 1 - (1 - progress) * (1 - progress);
      default:
        return progress;
    }
  }
}
```

## 🔧 Performance Optimization

### Rendering Optimization

```javascript
// Only render visible elements
const cullingSystem = {
  isInViewport(element, camera) {
    return (
      element.x >= camera.x - camera.width / 2 &&
      element.x <= camera.x + camera.width / 2 &&
      element.y >= camera.y - camera.height / 2 &&
      element.y <= camera.y + camera.height / 2
    );
  },
};

// Batch rendering operations
const renderBatch = {
  sprites: [],
  texts: [],
  shapes: [],

  addSprite(sprite) {
    this.sprites.push(sprite);
  },

  render(p5) {
    // Render all sprites in batch
    this.sprites.forEach(sprite => sprite.render(p5));
    this.sprites = [];
  },
};
```

### Memory Management

```javascript
class SceneManager {
  cleanupScene(scene) {
    // Clear event listeners
    scene.removeEventListeners();

    // Clear animations
    scene.clearAnimations();

    // Clear cached resources
    scene.clearCache();

    // Force garbage collection
    if (window.gc) window.gc();
  }
}
```

---

_The scene management system provides a robust, flexible foundation for UI/UX design with smooth transitions, efficient rendering, and comprehensive input handling._
