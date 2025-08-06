# Asset Management 🎨

This document provides a comprehensive overview of the asset management system in Bumper Vehicles, including image synchronization, the Media directory structure, and asset loading mechanisms.

## 🏗️ Architecture Overview

The asset management system provides **centralized asset storage** with **automated synchronization** across platforms:

- **Media Directory** - Centralized asset repository
- **Image Synchronization** - Automated asset distribution
- **Loading Systems** - Platform-specific asset loading
- **Caching Mechanisms** - Performance optimization

## 📁 Media Directory Structure

### Central Asset Repository (`Media/`)

The Media directory serves as the single source of truth for all game assets:

```
Media/
├── images/
│   ├── Ari_Alligator/          # Character sprites
│   │   ├── frame_1.png
│   │   ├── frame_2.png
│   │   └── ... (animation frames)
│   ├── Block/                  # Game objects
│   │   └── block.png
│   ├── Button_Icons/           # UI elements
│   │   ├── achievements_button.png
│   │   ├── characters_button.png
│   │   ├── powerups_button.png
│   │   └── upgrades_button.png
│   ├── MapScene/               # Map assets
│   │   └── Islands/
│   │       ├── cloud.png
│   │       └── example_island.png
│   ├── Misc/                   # Miscellaneous assets
│   │   └── bouncy_ball.png
│   ├── Penguin/                # Character sprites
│   │   ├── penguin_die01.png
│   │   ├── penguin_die01@2x.png
│   │   ├── penguin_hurt.png
│   │   ├── penguin_hurt@2x.png
│   │   ├── penguin_jump01.png
│   │   ├── penguin_jump01@2x.png
│   │   └── ... (animation frames)
│   ├── Powerups/               # Power-up assets
│   │   ├── biggy.png
│   │   ├── heart.png
│   │   ├── magnet.png
│   │   ├── mine.png
│   │   └── missile.png
│   ├── BVC_Example.png         # Example images
│   ├── coins.png
│   ├── desk.png
│   ├── landing_bay.png
│   ├── mystery_box.png
│   └── xp_capsule.png
└── README.md                   # Asset documentation
```

### Asset Categories

#### 1. Character Assets

- **Animation Frames** - Sprite sheets for character animations
- **Multiple Resolutions** - @2x versions for high-DPI displays
- **State Variations** - Different poses and actions

#### 2. Game Object Assets

- **Static Objects** - Blocks, obstacles, and environmental elements
- **Interactive Objects** - Power-ups, collectibles, and triggers
- **Background Elements** - Decorative and atmospheric assets

#### 3. UI Assets

- **Button Icons** - Interface elements and controls
- **HUD Elements** - Health bars, score displays, and status indicators
- **Menu Assets** - Navigation and selection elements

#### 4. Map Assets

- **Terrain Elements** - Islands, platforms, and environmental features
- **Atmospheric Effects** - Clouds, particles, and visual effects
- **Background Elements** - Sky, water, and environmental textures

## 🔄 Image Synchronization

### Synchronization Script (`scripts/update_images.js`)

The synchronization script automatically distributes assets from the Media directory to all client applications:

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
const SOURCE_DIR = path.join(__dirname, "..", "Media", "images");
const GAME_FRONTEND_DEST = path.join(
  __dirname,
  "..",
  "apps",
  "web-client",
  "public",
  "Images"
);
const MOBILE_FRONTEND_DEST = path.join(
  __dirname,
  "..",
  "apps",
  "mobile-client",
  "assets",
  "images"
);

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    return false;
  }

  ensureDirectoryExists(dest);

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${item}`);
    }
  }
}

function updateImages() {
  console.log("Starting image update process...");

  // Copy to web-client
  console.log("\nCopying images to web-client...");
  copyDirectory(SOURCE_DIR, GAME_FRONTEND_DEST);

  // Copy to mobile-client
  console.log("\nCopying images to mobile-client...");
  copyDirectory(SOURCE_DIR, MOBILE_FRONTEND_DEST);

  console.log("\nImage update completed successfully!");
}

// Run the script
updateImages();
```

### Usage

```bash
# Run synchronization script
node scripts/update_images.js

# Or add to package.json scripts
{
  "scripts": {
    "sync-assets": "node scripts/update_images.js"
  }
}

# Run with pnpm
pnpm sync-assets
```

## 🎮 Asset Loading Systems

### Web Client Loading (`apps/web-client/src/render-tools/images.js`)

The web client uses p5.js for image loading and caching:

```javascript
// Image loading configuration
export const images_to_load = [
  {
    type: "image",
    path: "Images/Penguin/penguin_walk01.png",
    operation: "loadPenguinWalkFrame1",
  },
  {
    type: "image",
    path: "Images/Penguin/penguin_walk02.png",
    operation: "loadPenguinWalkFrame2",
  },
  {
    type: "image",
    path: "Images/Powerups/heart.png",
    operation: "loadHeartPowerup",
  },
  {
    type: "image",
    path: "Images/Block/block.png",
    operation: "loadBlockSprite",
  },
];

// Async image loading function
export const loadImageAsync = async imagePath => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
};

// Image loading with progress tracking
export const loadImagesWithProgress = async (imageList, onProgress) => {
  const total = imageList.length;
  let loaded = 0;

  const loadPromises = imageList.map(async imageConfig => {
    try {
      const image = await loadImageAsync(imageConfig.path);
      loaded++;

      if (onProgress) {
        onProgress(loaded, total);
      }

      return { ...imageConfig, image };
    } catch (error) {
      console.error(`Failed to load image: ${imageConfig.path}`, error);
      loaded++;
      return { ...imageConfig, error };
    }
  });

  return Promise.all(loadPromises);
};
```

### Scene Manager Integration (`packages/client-logic/src/core/event-management/SceneManager.js`)

The SceneManager integrates with the image loading system:

```javascript
class SceneManager {
  constructor() {
    this.loadOperations = [];
    this.isLoading = false;
    this.loadProgress = 0;
  }

  addLoadOperation(operation) {
    this.loadOperations.push(operation);
  }

  async executeLoadOperations() {
    if (this.loadOperations.length === 0) return;

    this.isLoading = true;
    this.loadProgress = 0;

    try {
      for (let i = 0; i < this.loadOperations.length; i++) {
        const operation = this.loadOperations[i];

        // Execute the operation
        await operation.operation();

        // Update progress
        this.loadProgress = (i + 1) / this.loadOperations.length;

        // Notify progress
        this.onLoadProgress?.(this.loadProgress);
      }
    } catch (error) {
      console.error("Failed to execute load operations:", error);
    } finally {
      this.isLoading = false;
      this.loadOperations = [];
    }
  }

  // Inject image loading function from web client
  setLoadImageAsync(loadImageAsync) {
    this.loadImageAsync = loadImageAsync;
  }
}
```

### Game Renderer Integration (`packages/client-logic/src/core/rendering/GameRenderer.js`)

The GameRenderer manages image caching and rendering:

```javascript
class GameRenderer {
  constructor(config) {
    this.imageCache = new Map();
    this.loadingPromises = new Map();
  }

  async loadImage(imagePath) {
    // Check cache first
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath);
    }

    // Check if already loading
    if (this.loadingPromises.has(imagePath)) {
      return this.loadingPromises.get(imagePath);
    }

    // Load image
    const loadPromise = this.loadImageAsync(imagePath);
    this.loadingPromises.set(imagePath, loadPromise);

    try {
      const image = await loadPromise;
      this.imageCache.set(imagePath, image);
      this.loadingPromises.delete(imagePath);
      return image;
    } catch (error) {
      this.loadingPromises.delete(imagePath);
      throw error;
    }
  }

  getCachedImage(imagePath) {
    return this.imageCache.get(imagePath);
  }

  clearImageCache() {
    this.imageCache.clear();
    this.loadingPromises.clear();
  }
}
```

## 📱 Mobile Client Asset Loading

### React Native Asset Loading

The mobile client uses React Native's asset system:

```javascript
// apps/mobile-client/App.jsx
import { Asset } from "expo-asset";

class AssetLoader {
  static async loadAssets() {
    const assetList = [
      require("./assets/images/Penguin/penguin_walk01.png"),
      require("./assets/images/Penguin/penguin_walk02.png"),
      require("./assets/images/Powerups/heart.png"),
      require("./assets/images/Block/block.png"),
    ];

    const loadPromises = assetList.map(asset => Asset.loadAsync(asset));

    try {
      await Promise.all(loadPromises);
      console.log("All assets loaded successfully");
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  }
}

// Usage in App component
export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      await AssetLoader.loadAssets();
      setAssetsLoaded(true);
    }

    loadAssets();
  }, []);

  if (!assetsLoaded) {
    return <LoadingScreen />;
  }

  return <GameComponent />;
}
```

### Skia Integration

For high-performance graphics, the mobile client uses Skia:

```javascript
import { Canvas, Image, useImage } from "@shopify/react-native-skia";

const GameSprite = ({ imagePath, x, y, width, height }) => {
  const image = useImage(imagePath);

  if (!image) {
    return null; // Show loading state
  }

  return (
    <Canvas style={{ width, height }}>
      <Image image={image} x={x} y={y} width={width} height={height} />
    </Canvas>
  );
};
```

## 🎯 Asset Optimization

### Image Compression

```javascript
// Image compression utility
const compressImage = async (imageFile, quality = 0.8) => {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(resolve, "image/png", quality);
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

// Batch compression
const compressImageBatch = async (imageFiles, quality = 0.8) => {
  const compressedFiles = [];

  for (const file of imageFiles) {
    const compressed = await compressImage(file, quality);
    compressedFiles.push(compressed);
  }

  return compressedFiles;
};
```

### Asset Preloading

```javascript
// Preload critical assets
const preloadCriticalAssets = async () => {
  const criticalAssets = [
    "Images/Penguin/penguin_walk01.png",
    "Images/Block/block.png",
    "Images/Powerups/heart.png",
  ];

  const preloadPromises = criticalAssets.map(path => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = path;
    });
  });

  await Promise.all(preloadPromises);
  console.log("Critical assets preloaded");
};
```

## 🔧 Asset Management Tools

### Asset Validation

```javascript
// Validate asset integrity
const validateAssets = async assetList => {
  const validationResults = [];

  for (const asset of assetList) {
    try {
      const response = await fetch(asset.path);
      if (response.ok) {
        validationResults.push({
          path: asset.path,
          status: "valid",
          size: response.headers.get("content-length"),
        });
      } else {
        validationResults.push({
          path: asset.path,
          status: "missing",
          error: `HTTP ${response.status}`,
        });
      }
    } catch (error) {
      validationResults.push({
        path: asset.path,
        status: "error",
        error: error.message,
      });
    }
  }

  return validationResults;
};
```

### Asset Inventory

```javascript
// Generate asset inventory
const generateAssetInventory = mediaPath => {
  const inventory = {
    characters: [],
    powerups: [],
    blocks: [],
    ui: [],
    maps: [],
  };

  const scanDirectory = (dir, category) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath, file);
      } else if (file.endsWith(".png") || file.endsWith(".jpg")) {
        inventory[category] = inventory[category] || [];
        inventory[category].push({
          name: file,
          path: filePath,
          size: stat.size,
          modified: stat.mtime,
        });
      }
    });
  };

  scanDirectory(mediaPath, "misc");

  return inventory;
};
```

## 📊 Performance Monitoring

### Asset Loading Metrics

```javascript
// Track asset loading performance
const assetMetrics = {
  loadTimes: new Map(),
  cacheHits: 0,
  cacheMisses: 0,
  totalAssets: 0,
};

const trackAssetLoad = (assetPath, loadTime) => {
  assetMetrics.loadTimes.set(assetPath, loadTime);
  assetMetrics.totalAssets++;
};

const getAssetMetrics = () => {
  const avgLoadTime =
    Array.from(assetMetrics.loadTimes.values()).reduce(
      (sum, time) => sum + time,
      0
    ) / assetMetrics.loadTimes.size;

  return {
    averageLoadTime: avgLoadTime,
    cacheHitRate:
      assetMetrics.cacheHits /
      (assetMetrics.cacheHits + assetMetrics.cacheMisses),
    totalAssets: assetMetrics.totalAssets,
  };
};
```

### Memory Usage Monitoring

```javascript
// Monitor image cache memory usage
const monitorImageCache = imageCache => {
  let totalSize = 0;
  let imageCount = 0;

  imageCache.forEach((image, path) => {
    if (image.width && image.height) {
      // Estimate memory usage (4 bytes per pixel for RGBA)
      const estimatedSize = image.width * image.height * 4;
      totalSize += estimatedSize;
      imageCount++;
    }
  });

  return {
    totalSize: totalSize,
    imageCount: imageCount,
    averageSize: totalSize / imageCount,
  };
};
```

## 🔄 Asset Versioning

### Asset Version Control

```javascript
// Asset versioning system
const assetVersions = {
  "Images/Penguin/penguin_walk01.png": "1.2.0",
  "Images/Block/block.png": "1.0.0",
  "Images/Powerups/heart.png": "1.1.0",
};

const checkAssetVersion = assetPath => {
  return assetVersions[assetPath] || "1.0.0";
};

const validateAssetVersions = requiredAssets => {
  const validationResults = [];

  requiredAssets.forEach(asset => {
    const currentVersion = checkAssetVersion(asset.path);
    const requiredVersion = asset.minVersion || "1.0.0";

    validationResults.push({
      path: asset.path,
      currentVersion,
      requiredVersion,
      isValid: currentVersion >= requiredVersion,
    });
  });

  return validationResults;
};
```

## 🚀 Asset Deployment

### Production Asset Optimization

```javascript
// Production asset optimization
const optimizeForProduction = async assetList => {
  const optimizedAssets = [];

  for (const asset of assetList) {
    // Compress images
    const compressed = await compressImage(asset, 0.7);

    // Generate multiple resolutions
    const resolutions = await generateResolutions(asset, [1, 2, 3]);

    optimizedAssets.push({
      original: asset,
      compressed,
      resolutions,
    });
  }

  return optimizedAssets;
};

// Generate different resolutions
const generateResolutions = async (image, scales) => {
  const resolutions = {};

  for (const scale of scales) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    resolutions[scale] = blob;
  }

  return resolutions;
};
```

---

_The asset management system provides efficient, scalable asset handling with automated synchronization, performance optimization, and comprehensive monitoring capabilities._
