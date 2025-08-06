# Development Workflow

## Overview

The Bumper Vehicles project follows a structured development workflow that ensures code quality, maintainability, and efficient collaboration across the team. The workflow encompasses coding standards, testing strategies, version control practices, and deployment procedures.

## Development Environment Setup

### Prerequisites

```bash
# Required software
- Node.js (v18+)
- pnpm (v8+)
- MySQL (v8.0+)
- Git (v2.30+)
- VS Code (recommended)
- Docker (optional, for containerized development)
```

### Environment Configuration

```bash
# Clone repository
git clone https://github.com/your-username/bumper-vehicles.git
cd bumper-vehicles

# Install dependencies
pnpm install

# Set up environment variables
cp apps/server/env.example.development apps/server/.env
cp apps/landing-page/env.example apps/landing-page/.env
cp apps/web-client/env.example apps/web-client/.env

# Configure database
mysql -u root -p < packages/database/scripts/main.sql
```

### Development Tools

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "apps/server",
    "apps/landing-page",
    "apps/web-client",
    "apps/mobile-client",
    "packages/*"
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  }
}
```

## Coding Standards

### JavaScript/TypeScript Standards

```javascript
// ESLint configuration
// eslint.config.js
export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      // Code quality
      "no-unused-vars": "error",
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // Style
      indent: ["error", 2],
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "comma-dangle": ["error", "never"],

      // Best practices
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",

      // ES6+
      "arrow-spacing": "error",
      "prefer-arrow-callback": "error",
      "template-curly-spacing": "error",
    },
  },
];
```

### Code Style Guidelines

```javascript
// Naming conventions
const CONSTANTS = "UPPER_SNAKE_CASE";
const variables = "camelCase";
const functions = "camelCase";
const classes = "PascalCase";
const files = "kebab-case";

// File organization
// packages/client-logic/src/core/rendering/GameRenderer.js
class GameRenderer {
  // 1. Static properties
  static DEFAULT_CONFIG = {};

  // 2. Constructor
  constructor(config = {}) {
    // Initialize properties
  }

  // 3. Public methods
  render() {
    // Implementation
  }

  // 4. Private methods
  _privateMethod() {
    // Implementation
  }
}

// Function documentation
/**
 * Renders the current game state to the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {GameState} gameState - The current game state
 * @param {Camera} camera - The camera object
 * @returns {void}
 */
function renderGame(ctx, gameState, camera) {
  // Implementation
}
```

### Git Workflow

```bash
# Branch naming convention
feature/user-authentication
bugfix/login-validation
hotfix/security-patch
release/v1.2.0

# Commit message format
type(scope): description

# Examples
feat(auth): add JWT token validation
fix(api): resolve user registration error
docs(readme): update installation instructions
test(game): add unit tests for physics engine
refactor(renderer): optimize sprite rendering
```

### Pull Request Process

```markdown
<!-- Pull Request Template -->

## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No debugging code left
```

## Testing Strategy

### Unit Testing

```javascript
// packages/client-logic/__tests__/GameRenderer.test.js
import { GameRenderer } from "../src/core/rendering/GameRenderer";

describe("GameRenderer", () => {
  let renderer;
  let mockCanvas;

  beforeEach(() => {
    mockCanvas = {
      getContext: jest.fn().mockReturnValue({
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
      }),
    };
    renderer = new GameRenderer(mockCanvas);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("should initialize with default config", () => {
      expect(renderer.config.width).toBe(800);
      expect(renderer.config.height).toBe(600);
      expect(renderer.config.targetFPS).toBe(60);
    });

    test("should accept custom config", () => {
      const customConfig = { width: 1024, height: 768 };
      const customRenderer = new GameRenderer(mockCanvas, customConfig);

      expect(customRenderer.config.width).toBe(1024);
      expect(customRenderer.config.height).toBe(768);
    });
  });

  describe("render", () => {
    test("should render game state correctly", () => {
      const gameState = {
        players: [{ id: 1, position: { x: 100, y: 100 } }],
        entities: [],
      };

      renderer.render(gameState);

      expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
    });

    test("should handle empty game state", () => {
      const emptyState = { players: [], entities: [] };

      expect(() => renderer.render(emptyState)).not.toThrow();
    });
  });

  describe("performance", () => {
    test("should maintain target FPS", () => {
      const startTime = performance.now();

      for (let i = 0; i < 60; i++) {
        renderer.render({ players: [], entities: [] });
      }

      const endTime = performance.now();
      const averageFrameTime = (endTime - startTime) / 60;

      expect(averageFrameTime).toBeLessThan(16.67); // 60 FPS = 16.67ms per frame
    });
  });
});
```

### Integration Testing

```javascript
// apps/server/__tests__/integration/game.test.js
import request from "supertest";
import { app } from "../../server";
import { createTestDatabase, cleanupTestDatabase } from "../utils/testDb";

describe("Game API Integration", () => {
  let testDb;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe("POST /api/games/create", () => {
    test("should create new game session", async () => {
      const gameData = {
        gameType: "multiplayer",
        mapId: "island_arena",
        maxPlayers: 4,
      };

      const response = await request(app)
        .post("/api/games/create")
        .set("Authorization", "Bearer test-token")
        .send(gameData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.session.sessionId).toBeDefined();
      expect(response.body.session.gameType).toBe("multiplayer");
    });

    test("should validate required fields", async () => {
      const invalidData = { gameType: "invalid" };

      const response = await request(app)
        .post("/api/games/create")
        .set("Authorization", "Bearer test-token")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("WebSocket Game Events", () => {
    test("should handle player join event", async () => {
      const socket = io("http://localhost:3000");

      socket.emit("join-game", {
        sessionId: "test-session",
        playerName: "testplayer",
        characterId: "penguin",
      });

      await new Promise(resolve => {
        socket.on("player-joined", data => {
          expect(data.player.name).toBe("testplayer");
          expect(data.player.characterId).toBe("penguin");
          resolve();
        });
      });

      socket.disconnect();
    });
  });
});
```

### End-to-End Testing

```javascript
// e2e/tests/game-flow.test.js
import { test, expect } from "@playwright/test";

test.describe("Game Flow", () => {
  test("complete game session", async ({ page }) => {
    // Navigate to game
    await page.goto("http://localhost:3000");

    // Login
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for login
    await page.waitForSelector('[data-testid="game-menu"]');

    // Create game
    await page.click('[data-testid="create-game-button"]');
    await page.selectOption('[data-testid="map-select"]', "island_arena");
    await page.click('[data-testid="start-game-button"]');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-canvas"]');

    // Verify game elements
    await expect(page.locator('[data-testid="player-health"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-display"]')).toBeVisible();

    // Simulate game actions
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowRight");

    // Verify player movement
    const playerPosition = await page
      .locator('[data-testid="player"]')
      .getAttribute("style");
    expect(playerPosition).toContain("transform");
  });

  test("multiplayer game session", async ({ browser }) => {
    // Create two browser contexts for multiplayer testing
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both players join the same game
    await page1.goto("http://localhost:3000");
    await page2.goto("http://localhost:3000");

    // Login both players
    await loginPlayer(page1, "player1@example.com", "password123");
    await loginPlayer(page2, "player2@example.com", "password123");

    // Join same game session
    const sessionId = await createGameSession(page1);
    await joinGameSession(page2, sessionId);

    // Verify both players in game
    await expect(page1.locator('[data-testid="player-count"]')).toHaveText("2");
    await expect(page2.locator('[data-testid="player-count"]')).toHaveText("2");

    // Test real-time synchronization
    await page1.keyboard.press("ArrowUp");
    await page1.waitForTimeout(100);

    // Verify player2 sees player1's movement
    const player1Position = await page2
      .locator('[data-testid="player-1"]')
      .getAttribute("style");
    expect(player1Position).toContain("transform");
  });
});

async function loginPlayer(page, email, password) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="game-menu"]');
}

async function createGameSession(page) {
  await page.click('[data-testid="create-game-button"]');
  await page.selectOption('[data-testid="map-select"]', "island_arena");
  await page.click('[data-testid="start-game-button"]');
  await page.waitForSelector('[data-testid="game-canvas"]');

  // Return session ID from URL or game state
  return await page.evaluate(() => {
    return window.gameState.sessionId;
  });
}

async function joinGameSession(page, sessionId) {
  await page.click('[data-testid="join-game-button"]');
  await page.fill('[data-testid="session-id-input"]', sessionId);
  await page.click('[data-testid="join-button"]');
  await page.waitForSelector('[data-testid="game-canvas"]');
}
```

## Code Review Process

### Review Checklist

```markdown
## Code Review Checklist

### Functionality

- [ ] Code works as intended
- [ ] No breaking changes
- [ ] Backward compatibility maintained
- [ ] Error handling implemented
- [ ] Edge cases considered

### Code Quality

- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] Meaningful variable names
- [ ] Proper comments and documentation

### Testing

- [ ] Unit tests written
- [ ] Integration tests updated
- [ ] Test coverage adequate
- [ ] All tests passing

### Security

- [ ] No security vulnerabilities
- [ ] Input validation implemented
- [ ] Authentication/authorization proper
- [ ] No sensitive data exposed

### Performance

- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Memory usage optimized
- [ ] Database queries optimized

### Documentation

- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Code comments clear
- [ ] Commit messages descriptive
```

### Review Guidelines

```javascript
// Example of good code review feedback

// ❌ Bad feedback
"This code is wrong"

// ✅ Good feedback
"The collision detection logic in line 45 doesn't handle edge cases where entities are exactly at the boundary. Consider adding a small epsilon value to prevent floating-point precision issues."

// ❌ Bad feedback
"Fix the styling"

// ✅ Good feedback
"The button styling in the mobile view doesn't follow our design system. Please use the `Button` component from our UI library instead of custom CSS, and ensure it matches the spacing guidelines in our style guide."

// ❌ Bad feedback
"Add tests"

// ✅ Good feedback
"The `GameRenderer.render()` method needs unit tests to cover the new sprite animation logic. Please add tests for:
1. Animation frame progression
2. Loop behavior when animation ends
3. Error handling for missing sprite assets
4. Performance with multiple animated sprites"
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: bumper_vehicles_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: root
          DB_NAME: bumper_vehicles_test

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Build applications
        run: pnpm build

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Deployment Process

### Development Deployment

```bash
# Local development
pnpm dev

# Docker development
docker-compose -f docker-compose.local.yml up

# Database migrations
pnpm db:migrate

# Seed test data
pnpm db:seed
```

### Staging Deployment

```bash
# Deploy to staging
pnpm deploy:staging

# Run staging tests
pnpm test:staging

# Health check
curl https://staging.bumpervehicles.com/health
```

### Production Deployment

```bash
# Deploy to production
pnpm deploy:production

# Database migration
pnpm db:migrate:production

# Health check
curl https://bumpervehicles.com/health

# Monitor deployment
pnpm monitor:deployment
```

## Monitoring and Debugging

### Performance Monitoring

```javascript
// packages/client-logic/src/utils/PerformanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      network: [],
      errors: [],
    };
  }

  // Monitor FPS
  monitorFPS() {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.metrics.fps.push(fps);

        if (fps < 30) {
          console.warn("Low FPS detected:", fps);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  // Monitor memory usage
  monitorMemory() {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.memory.push({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }, 5000);
    }
  }

  // Monitor network requests
  monitorNetwork() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.metrics.network.push({
          url: args[0],
          duration,
          status: response.status,
        });

        return response;
      } catch (error) {
        this.metrics.errors.push({
          type: "network",
          error: error.message,
          url: args[0],
        });
        throw error;
      }
    };
  }

  // Get performance report
  getReport() {
    return {
      fps: {
        average: this.average(this.metrics.fps),
        min: Math.min(...this.metrics.fps),
        max: Math.max(...this.metrics.fps),
      },
      memory: this.metrics.memory[this.metrics.memory.length - 1],
      network: {
        averageResponseTime: this.average(
          this.metrics.network.map(n => n.duration)
        ),
        totalRequests: this.metrics.network.length,
      },
      errors: this.metrics.errors.length,
    };
  }

  average(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
  }
}
```

### Error Tracking

```javascript
// packages/client-logic/src/utils/ErrorTracker.js
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  // Track JavaScript errors
  trackErrors() {
    window.addEventListener("error", event => {
      this.logError({
        type: "javascript",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // Track unhandled promise rejections
    window.addEventListener("unhandledrejection", event => {
      this.logError({
        type: "promise",
        message: event.reason?.message || "Unhandled promise rejection",
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Log custom errors
  logError(error) {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Send to error tracking service
    this.sendToService(error);
  }

  // Send error to tracking service
  async sendToService(error) {
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(error),
      });
    } catch (e) {
      console.error("Failed to send error to tracking service:", e);
    }
  }

  // Get error summary
  getErrorSummary() {
    const errorTypes = {};
    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType: errorTypes,
      recent: this.errors.slice(-10),
    };
  }
}
```

## Documentation Standards

### Code Documentation

````javascript
/**
 * GameRenderer handles the visual rendering of the game state
 *
 * @class GameRenderer
 * @description Main rendering class that manages canvas operations, sprite rendering, and performance optimization
 *
 * @example
 * ```javascript
 * const renderer = new GameRenderer(canvas, {
 *   width: 800,
 *   height: 600,
 *   targetFPS: 60
 * });
 *
 * renderer.render(gameState);
 * ```
 */
class GameRenderer {
  /**
   * Creates a new GameRenderer instance
   *
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {Object} config - Configuration options
   * @param {number} config.width - Canvas width in pixels
   * @param {number} config.height - Canvas height in pixels
   * @param {number} config.targetFPS - Target frames per second
   * @param {boolean} config.enableWebGL - Whether to use WebGL rendering
   */
  constructor(canvas, config = {}) {
    // Implementation
  }

  /**
   * Renders the current game state to the canvas
   *
   * @param {GameState} gameState - The current game state to render
   * @param {Object} options - Rendering options
   * @param {boolean} options.skipUI - Whether to skip UI rendering
   * @returns {void}
   *
   * @throws {Error} If gameState is invalid or canvas is not available
   *
   * @example
   * ```javascript
   * renderer.render(gameState, { skipUI: false });
   * ```
   */
  render(gameState, options = {}) {
    // Implementation
  }
}
````

### API Documentation

```javascript
/**
 * @api {post} /api/games/create Create Game Session
 * @apiName CreateGame
 * @apiGroup Games
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiBody {String} gameType Type of game (multiplayer, solo, training)
 * @apiBody {String} mapId ID of the map to use
 * @apiBody {Number} maxPlayers Maximum number of players (2-8)
 * @apiBody {Object} gameSettings Additional game settings
 * @apiBody {Number} gameSettings.timeLimit Time limit in seconds
 * @apiBody {Boolean} gameSettings.powerupsEnabled Whether powerups are enabled
 *
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {Object} session Game session information
 * @apiSuccess {String} session.sessionId Unique session identifier
 * @apiSuccess {String} session.gameType Type of game created
 * @apiSuccess {String} session.mapId Map identifier
 * @apiSuccess {Number} session.maxPlayers Maximum players allowed
 * @apiSuccess {Number} session.currentPlayers Current number of players
 * @apiSuccess {String} session.status Session status (waiting, active, ended)
 *
 * @apiError {Object} 400 Validation error
 * @apiError {String} 400.error.code Error code
 * @apiError {String} 400.error.message Error message
 *
 * @apiError {Object} 401 Authentication error
 * @apiError {String} 401.error.message Authentication failed
 *
 * @apiError {Object} 500 Server error
 * @apiError {String} 500.error.message Internal server error
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST https://api.bumpervehicles.com/api/games/create \
 *       -H "Authorization: Bearer token" \
 *       -H "Content-Type: application/json" \
 *       -d '{
 *         "gameType": "multiplayer",
 *         "mapId": "island_arena",
 *         "maxPlayers": 4,
 *         "gameSettings": {
 *           "timeLimit": 300,
 *           "powerupsEnabled": true
 *         }
 *       }'
 */
```

This comprehensive development workflow ensures consistent code quality, efficient collaboration, and reliable deployment processes for the Bumper Vehicles project.
