# Physics System

## Overview

The Bumper Vehicles physics system is a custom-built 2D physics engine that handles collision detection, rigid body dynamics, and spatial partitioning for optimal performance. The system is designed to support real-time multiplayer gameplay with smooth physics simulation and accurate collision responses.

## Architecture Overview

### Physics System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Physics World                           │
├─────────────────────────────────────────────────────────────┤
│  Spatial Partitioning     │  Collision Detection          │
│  • TileMap System        │  • BoundingBox Checks         │
│  • QuadTree              │  • Broad Phase                │
│  • Spatial Hashing       │  • Narrow Phase               │
│  • Grid System           │  • Collision Response          │
└─────────────────────────────────────────────────────────────┘
                              │
                    Physics Entities
                              │
┌─────────────────────────────────────────────────────────────┐
│  Static Entities          │  Dynamic Entities             │
│  • Obstacles             │  • Players                    │
│  • Boundaries            │  • Projectiles                │
│  • Powerups              │  • Particles                  │
│  • Checkpoints           │  • Explosions                 │
└─────────────────────────────────────────────────────────────┘
```

## Physics World

### Core Physics Engine

```javascript
// apps/server/src/physics/PhysicsWorld.js
class PhysicsWorld {
  constructor(config = {}) {
    this.config = {
      gravity: { x: 0, y: 0 },
      airResistance: 0.98,
      maxVelocity: 500,
      timeStep: 1 / 60,
      maxSubSteps: 5,
      ...config,
    };

    this.entities = new Map();
    this.staticEntities = new Map();
    this.dynamicEntities = new Map();

    // Spatial partitioning
    this.spatialGrid = new SpatialGrid({
      cellSize: 64,
      worldBounds: { width: 2000, height: 2000 },
    });

    // Collision detection
    this.collisionGroups = new Map();
    this.collisionMatrix = new CollisionMatrix();

    // Performance monitoring
    this.stats = {
      updateTime: 0,
      collisionChecks: 0,
      entityCount: 0,
    };
  }

  // Main update loop
  update(deltaTime) {
    const startTime = performance.now();

    // Update all dynamic entities
    this.updateDynamicEntities(deltaTime);

    // Perform collision detection
    this.performCollisionDetection();

    // Update spatial partitioning
    this.updateSpatialPartitioning();

    // Update statistics
    this.updateStats(performance.now() - startTime);
  }

  updateDynamicEntities(deltaTime) {
    this.dynamicEntities.forEach(entity => {
      if (entity.isActive) {
        this.updateEntity(entity, deltaTime);
      }
    });
  }

  updateEntity(entity, deltaTime) {
    // Apply forces
    this.applyForces(entity, deltaTime);

    // Update velocity
    entity.velocity.x += entity.acceleration.x * deltaTime;
    entity.velocity.y += entity.acceleration.y * deltaTime;

    // Apply air resistance
    entity.velocity.x *= this.config.airResistance;
    entity.velocity.y *= this.config.airResistance;

    // Clamp velocity
    const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
    if (speed > this.config.maxVelocity) {
      const scale = this.config.maxVelocity / speed;
      entity.velocity.x *= scale;
      entity.velocity.y *= scale;
    }

    // Update position
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;

    // Update rotation
    if (entity.angularVelocity !== 0) {
      entity.rotation += entity.angularVelocity * deltaTime;
    }

    // Update bounding box
    entity.updateBoundingBox();
  }

  applyForces(entity, deltaTime) {
    // Apply gravity
    entity.acceleration.x += this.config.gravity.x;
    entity.acceleration.y += this.config.gravity.y;

    // Apply custom forces
    if (entity.forces) {
      entity.forces.forEach(force => {
        entity.acceleration.x += force.x;
        entity.acceleration.y += force.y;
      });
    }

    // Reset acceleration for next frame
    entity.acceleration.x = 0;
    entity.acceleration.y = 0;
  }

  // Entity management
  addEntity(entity) {
    this.entities.set(entity.id, entity);

    if (entity.isStatic) {
      this.staticEntities.set(entity.id, entity);
    } else {
      this.dynamicEntities.set(entity.id, entity);
    }

    // Add to spatial partitioning
    this.spatialGrid.insert(entity);

    // Add to collision groups
    this.addToCollisionGroup(entity);
  }

  removeEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (entity) {
      this.entities.delete(entityId);
      this.staticEntities.delete(entityId);
      this.dynamicEntities.delete(entityId);

      // Remove from spatial partitioning
      this.spatialGrid.remove(entity);

      // Remove from collision groups
      this.removeFromCollisionGroup(entity);
    }
  }

  getEntity(entityId) {
    return this.entities.get(entityId);
  }

  // Spatial partitioning
  updateSpatialPartitioning() {
    this.spatialGrid.clear();

    // Reinsert all entities
    this.entities.forEach(entity => {
      this.spatialGrid.insert(entity);
    });
  }

  // Performance monitoring
  updateStats(updateTime) {
    this.stats.updateTime = updateTime;
    this.stats.entityCount = this.entities.size;
  }

  getStats() {
    return {
      ...this.stats,
      staticEntities: this.staticEntities.size,
      dynamicEntities: this.dynamicEntities.size,
      spatialGridCells: this.spatialGrid.getCellCount(),
    };
  }
}
```

## Collision Detection

### BoundingBox System

```javascript
// apps/server/src/physics/BoundingBox.js
class BoundingBox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Basic collision detection
  intersects(other) {
    return !(
      this.x + this.width <= other.x ||
      other.x + other.width <= this.x ||
      this.y + this.height <= other.y ||
      other.y + other.height <= this.y
    );
  }

  // Point containment
  contains(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  // Expand bounding box
  expand(amount) {
    return new BoundingBox(
      this.x - amount,
      this.y - amount,
      this.width + amount * 2,
      this.height + amount * 2
    );
  }

  // Union of two bounding boxes
  union(other) {
    const minX = Math.min(this.x, other.x);
    const minY = Math.min(this.y, other.y);
    const maxX = Math.max(this.x + this.width, other.x + other.width);
    const maxY = Math.max(this.y + this.height, other.y + other.height);

    return new BoundingBox(minX, minY, maxX - minX, maxY - minY);
  }

  // Get center point
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  // Get area
  getArea() {
    return this.width * this.height;
  }
}
```

### Collision Detection System

```javascript
// apps/server/src/physics/CollisionDetector.js
class CollisionDetector {
  constructor(physicsWorld) {
    this.physicsWorld = physicsWorld;
    this.collisionPairs = [];
    this.collisionCallbacks = new Map();
  }

  // Main collision detection
  performCollisionDetection() {
    this.collisionPairs = [];
    this.stats.collisionChecks = 0;

    // Broad phase - find potential collision pairs
    const potentialPairs = this.broadPhase();

    // Narrow phase - detailed collision detection
    potentialPairs.forEach(pair => {
      if (this.narrowPhase(pair.entityA, pair.entityB)) {
        this.collisionPairs.push(pair);
        this.handleCollision(pair.entityA, pair.entityB);
      }
    });
  }

  // Broad phase collision detection
  broadPhase() {
    const pairs = [];
    const entities = Array.from(this.physicsWorld.entities.values());

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        // Check collision groups
        if (this.canCollide(entityA, entityB)) {
          // Use spatial partitioning for efficiency
          if (this.spatialPartitioningCheck(entityA, entityB)) {
            pairs.push({ entityA, entityB });
          }
        }

        this.stats.collisionChecks++;
      }
    }

    return pairs;
  }

  // Narrow phase collision detection
  narrowPhase(entityA, entityB) {
    // Check bounding box intersection
    if (!entityA.boundingBox.intersects(entityB.boundingBox)) {
      return false;
    }

    // Entity-specific collision detection
    if (
      entityA.collisionType === "circle" &&
      entityB.collisionType === "circle"
    ) {
      return this.circleCircleCollision(entityA, entityB);
    } else if (
      entityA.collisionType === "rectangle" &&
      entityB.collisionType === "rectangle"
    ) {
      return this.rectangleRectangleCollision(entityA, entityB);
    } else {
      return this.circleRectangleCollision(entityA, entityB);
    }
  }

  // Circle-circle collision
  circleCircleCollision(entityA, entityB) {
    const dx = entityB.position.x - entityA.position.x;
    const dy = entityB.position.y - entityA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = entityA.radius + entityB.radius;

    return distance <= minDistance;
  }

  // Rectangle-rectangle collision
  rectangleRectangleCollision(entityA, entityB) {
    return entityA.boundingBox.intersects(entityB.boundingBox);
  }

  // Circle-rectangle collision
  circleRectangleCollision(circle, rectangle) {
    const closestX = Math.max(
      rectangle.boundingBox.x,
      Math.min(
        circle.position.x,
        rectangle.boundingBox.x + rectangle.boundingBox.width
      )
    );
    const closestY = Math.max(
      rectangle.boundingBox.y,
      Math.min(
        circle.position.y,
        rectangle.boundingBox.y + rectangle.boundingBox.height
      )
    );

    const distanceX = circle.position.x - closestX;
    const distanceY = circle.position.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared <= circle.radius * circle.radius;
  }

  // Collision response
  handleCollision(entityA, entityB) {
    // Get collision callback
    const callback = this.getCollisionCallback(entityA.type, entityB.type);
    if (callback) {
      callback(entityA, entityB);
    }

    // Apply physics response
    this.applyCollisionResponse(entityA, entityB);
  }

  applyCollisionResponse(entityA, entityB) {
    if (entityA.isStatic && entityB.isStatic) {
      return; // Static entities don't respond to collisions
    }

    // Calculate collision normal
    const normal = this.calculateCollisionNormal(entityA, entityB);

    // Apply impulse-based collision response
    if (!entityA.isStatic && !entityB.isStatic) {
      this.applyImpulseResponse(entityA, entityB, normal);
    } else if (entityA.isStatic) {
      this.applyStaticCollisionResponse(entityB, entityA, normal);
    } else {
      this.applyStaticCollisionResponse(entityA, entityB, normal);
    }
  }

  calculateCollisionNormal(entityA, entityB) {
    const dx = entityB.position.x - entityA.position.x;
    const dy = entityB.position.y - entityA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return { x: 1, y: 0 }; // Default normal
    }

    return {
      x: dx / distance,
      y: dy / distance,
    };
  }

  applyImpulseResponse(entityA, entityB, normal) {
    const relativeVelocity = {
      x: entityB.velocity.x - entityA.velocity.x,
      y: entityB.velocity.y - entityA.velocity.y,
    };

    const velocityAlongNormal =
      relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    if (velocityAlongNormal > 0) {
      return; // Entities are moving apart
    }

    const restitution = Math.min(entityA.restitution, entityB.restitution);
    const j = -(1 + restitution) * velocityAlongNormal;

    const impulse = {
      x: j * normal.x,
      y: j * normal.y,
    };

    // Apply impulse
    entityA.velocity.x -= impulse.x / entityA.mass;
    entityA.velocity.y -= impulse.y / entityA.mass;
    entityB.velocity.x += impulse.x / entityB.mass;
    entityB.velocity.y += impulse.y / entityB.mass;
  }

  applyStaticCollisionResponse(dynamicEntity, staticEntity, normal) {
    // Simple separation response
    const overlap = this.calculateOverlap(dynamicEntity, staticEntity);
    if (overlap > 0) {
      dynamicEntity.position.x += normal.x * overlap;
      dynamicEntity.position.y += normal.y * overlap;
    }

    // Reflect velocity
    const dotProduct =
      dynamicEntity.velocity.x * normal.x + dynamicEntity.velocity.y * normal.y;

    dynamicEntity.velocity.x -= 2 * dotProduct * normal.x;
    dynamicEntity.velocity.y -= 2 * dotProduct * normal.y;
  }

  // Collision group management
  canCollide(entityA, entityB) {
    const groupA = entityA.collisionGroup;
    const groupB = entityB.collisionGroup;

    return this.physicsWorld.collisionMatrix.canCollide(groupA, groupB);
  }

  // Spatial partitioning check
  spatialPartitioningCheck(entityA, entityB) {
    return this.physicsWorld.spatialGrid.checkCollision(entityA, entityB);
  }
}
```

## Spatial Partitioning

### Spatial Grid System

```javascript
// apps/server/src/physics/SpatialGrid.js
class SpatialGrid {
  constructor(config) {
    this.cellSize = config.cellSize || 64;
    this.worldBounds = config.worldBounds || { width: 2000, height: 2000 };

    this.grid = new Map();
    this.cellCount = 0;
  }

  // Convert world position to grid coordinates
  worldToGrid(position) {
    return {
      x: Math.floor(position.x / this.cellSize),
      y: Math.floor(position.y / this.cellSize),
    };
  }

  // Get grid key
  getGridKey(gridPos) {
    return `${gridPos.x},${gridPos.y}`;
  }

  // Insert entity into grid
  insert(entity) {
    const gridPos = this.worldToGrid(entity.position);
    const key = this.getGridKey(gridPos);

    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
      this.cellCount++;
    }

    this.grid.get(key).add(entity);
  }

  // Remove entity from grid
  remove(entity) {
    const gridPos = this.worldToGrid(entity.position);
    const key = this.getGridKey(gridPos);

    const cell = this.grid.get(key);
    if (cell) {
      cell.delete(entity);
      if (cell.size === 0) {
        this.grid.delete(key);
        this.cellCount--;
      }
    }
  }

  // Get entities in a region
  getEntitiesInRegion(bounds) {
    const entities = new Set();

    const minGrid = this.worldToGrid({ x: bounds.x, y: bounds.y });
    const maxGrid = this.worldToGrid({
      x: bounds.x + bounds.width,
      y: bounds.y + bounds.height,
    });

    for (let x = minGrid.x; x <= maxGrid.x; x++) {
      for (let y = minGrid.y; y <= maxGrid.y; y++) {
        const key = this.getGridKey({ x, y });
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(entity => entities.add(entity));
        }
      }
    }

    return Array.from(entities);
  }

  // Check collision between two entities
  checkCollision(entityA, entityB) {
    const gridA = this.worldToGrid(entityA.position);
    const gridB = this.worldToGrid(entityB.position);

    // Check if entities are in adjacent cells
    const dx = Math.abs(gridA.x - gridB.x);
    const dy = Math.abs(gridA.y - gridB.y);

    return dx <= 1 && dy <= 1;
  }

  // Clear all cells
  clear() {
    this.grid.clear();
    this.cellCount = 0;
  }

  // Get cell count
  getCellCount() {
    return this.cellCount;
  }

  // Get grid statistics
  getStats() {
    let totalEntities = 0;
    let maxEntitiesPerCell = 0;

    this.grid.forEach(cell => {
      totalEntities += cell.size;
      maxEntitiesPerCell = Math.max(maxEntitiesPerCell, cell.size);
    });

    return {
      cellCount: this.cellCount,
      totalEntities,
      maxEntitiesPerCell,
      averageEntitiesPerCell: totalEntities / this.cellCount || 0,
    };
  }
}
```

## Physics Entities

### Base Physics Entity

```javascript
// apps/server/src/physics/Entity.js
class PhysicsEntity {
  constructor(id, config) {
    this.id = id;
    this.type = config.type || "entity";
    this.collisionType = config.collisionType || "rectangle";
    this.collisionGroup = config.collisionGroup || "default";

    // Physics properties
    this.position = config.position || { x: 0, y: 0 };
    this.velocity = config.velocity || { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.rotation = config.rotation || 0;
    this.angularVelocity = config.angularVelocity || 0;

    // Mass and physics properties
    this.mass = config.mass || 1.0;
    this.restitution = config.restitution || 0.5;
    this.friction = config.friction || 0.1;

    // Collision properties
    this.radius = config.radius || 0;
    this.width = config.width || 32;
    this.height = config.height || 32;
    this.boundingBox = new BoundingBox(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    );

    // State
    this.isActive = true;
    this.isStatic = config.isStatic || false;
    this.forces = [];

    // Custom properties
    this.userData = config.userData || {};
  }

  // Update bounding box
  updateBoundingBox() {
    this.boundingBox.x = this.position.x - this.width / 2;
    this.boundingBox.y = this.position.y - this.height / 2;
  }

  // Add force
  addForce(force) {
    this.forces.push(force);
  }

  // Clear forces
  clearForces() {
    this.forces = [];
  }

  // Set position
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.updateBoundingBox();
  }

  // Set velocity
  setVelocity(x, y) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  // Get physics state
  getPhysicsState() {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      velocity: { ...this.velocity },
      rotation: this.rotation,
      isActive: this.isActive,
    };
  }

  // Clone entity
  clone() {
    return new PhysicsEntity(this.id, {
      type: this.type,
      collisionType: this.collisionType,
      collisionGroup: this.collisionGroup,
      position: { ...this.position },
      velocity: { ...this.velocity },
      rotation: this.rotation,
      mass: this.mass,
      restitution: this.restitution,
      friction: this.friction,
      radius: this.radius,
      width: this.width,
      height: this.height,
      isStatic: this.isStatic,
      userData: { ...this.userData },
    });
  }
}
```

### Player Physics Entity

```javascript
// apps/server/src/game_entities/PlayerEntity.js
class PlayerEntity extends PhysicsEntity {
  constructor(id, config) {
    super(id, {
      type: "player",
      collisionType: "circle",
      collisionGroup: "players",
      mass: 10.0,
      restitution: 0.8,
      friction: 0.2,
      radius: 25,
      ...config,
    });

    // Player-specific properties
    this.characterId = config.characterId || "penguin";
    this.playerName = config.playerName || "Player";
    this.health = config.health || 100;
    this.maxHealth = config.maxHealth || 100;
    this.score = config.score || 0;
    this.isAlive = true;

    // Movement properties
    this.maxSpeed = config.maxSpeed || 200;
    this.acceleration = config.acceleration || 800;
    this.turnSpeed = config.turnSpeed || 3.0;

    // Powerups
    this.activePowerups = new Map();
    this.powerupTimers = new Map();

    // Input state
    this.inputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false,
    };
  }

  // Update player physics
  update(deltaTime) {
    if (!this.isActive || !this.isAlive) {
      return;
    }

    // Handle input
    this.handleInput(deltaTime);

    // Update powerups
    this.updatePowerups(deltaTime);

    // Update physics
    super.update(deltaTime);

    // Clamp speed
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }
  }

  // Handle player input
  handleInput(deltaTime) {
    let inputX = 0;
    let inputY = 0;

    if (this.inputState.up) inputY -= 1;
    if (this.inputState.down) inputY += 1;
    if (this.inputState.left) inputX -= 1;
    if (this.inputState.right) inputX += 1;

    // Normalize input
    if (inputX !== 0 || inputY !== 0) {
      const length = Math.sqrt(inputX * inputX + inputY * inputY);
      inputX /= length;
      inputY /= length;

      // Apply acceleration
      this.acceleration.x = inputX * this.acceleration;
      this.acceleration.y = inputY * this.acceleration;

      // Update rotation
      this.rotation = Math.atan2(inputY, inputX);
    }
  }

  // Update powerups
  updatePowerups(deltaTime) {
    this.powerupTimers.forEach((timer, powerupType) => {
      timer -= deltaTime;
      if (timer <= 0) {
        this.removePowerup(powerupType);
      } else {
        this.powerupTimers.set(powerupType, timer);
      }
    });
  }

  // Add powerup
  addPowerup(powerupType, duration) {
    this.activePowerups.set(powerupType, true);
    this.powerupTimers.set(powerupType, duration);

    // Apply powerup effects
    this.applyPowerupEffect(powerupType);
  }

  // Remove powerup
  removePowerup(powerupType) {
    this.activePowerups.delete(powerupType);
    this.powerupTimers.delete(powerupType);

    // Remove powerup effects
    this.removePowerupEffect(powerupType);
  }

  // Apply powerup effects
  applyPowerupEffect(powerupType) {
    switch (powerupType) {
      case "speed_boost":
        this.maxSpeed *= 1.5;
        break;
      case "health_boost":
        this.health = Math.min(this.maxHealth, this.health + 50);
        break;
      case "shield":
        // Add shield effect
        break;
    }
  }

  // Remove powerup effects
  removePowerupEffect(powerupType) {
    switch (powerupType) {
      case "speed_boost":
        this.maxSpeed /= 1.5;
        break;
      case "shield":
        // Remove shield effect
        break;
    }
  }

  // Take damage
  takeDamage(amount) {
    if (!this.isAlive) return;

    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  // Respawn
  respawn(position) {
    this.setPosition(position.x, position.y);
    this.setVelocity(0, 0);
    this.health = this.maxHealth;
    this.isAlive = true;
    this.activePowerups.clear();
    this.powerupTimers.clear();
  }

  // Get player state
  getPlayerState() {
    return {
      ...this.getPhysicsState(),
      characterId: this.characterId,
      playerName: this.playerName,
      health: this.health,
      maxHealth: this.maxHealth,
      score: this.score,
      isAlive: this.isAlive,
      activePowerups: Array.from(this.activePowerups.keys()),
    };
  }
}
```

## Performance Optimization

### Collision Matrix

```javascript
// apps/server/src/physics/CollisionMatrix.js
class CollisionMatrix {
  constructor() {
    this.matrix = new Map();
    this.groups = new Set();
  }

  // Add collision group
  addGroup(groupName) {
    this.groups.add(groupName);
  }

  // Set collision between groups
  setCollision(groupA, groupB, canCollide = true) {
    const key = this.getMatrixKey(groupA, groupB);
    this.matrix.set(key, canCollide);
  }

  // Check if two groups can collide
  canCollide(groupA, groupB) {
    const key = this.getMatrixKey(groupA, groupB);
    return this.matrix.get(key) !== false;
  }

  // Get matrix key
  getMatrixKey(groupA, groupB) {
    // Ensure consistent ordering
    if (groupA < groupB) {
      return `${groupA}:${groupB}`;
    } else {
      return `${groupB}:${groupA}`;
    }
  }

  // Get all collision rules
  getCollisionRules() {
    const rules = {};
    this.matrix.forEach((canCollide, key) => {
      rules[key] = canCollide;
    });
    return rules;
  }
}
```

### Physics Performance Monitoring

```javascript
// apps/server/src/physics/PhysicsProfiler.js
class PhysicsProfiler {
  constructor() {
    this.metrics = {
      updateTime: 0,
      collisionChecks: 0,
      collisionResolutions: 0,
      entityCount: 0,
      spatialGridCells: 0,
      frameCount: 0,
    };

    this.history = [];
    this.maxHistorySize = 100;
  }

  // Start profiling frame
  startFrame() {
    this.frameStartTime = performance.now();
    this.metrics.collisionChecks = 0;
    this.metrics.collisionResolutions = 0;
  }

  // End profiling frame
  endFrame() {
    this.metrics.updateTime = performance.now() - this.frameStartTime;
    this.metrics.frameCount++;

    // Store in history
    this.history.push({ ...this.metrics });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // Record collision check
  recordCollisionCheck() {
    this.metrics.collisionChecks++;
  }

  // Record collision resolution
  recordCollisionResolution() {
    this.metrics.collisionResolutions++;
  }

  // Update entity count
  updateEntityCount(count) {
    this.metrics.entityCount = count;
  }

  // Update spatial grid cell count
  updateSpatialGridCells(count) {
    this.metrics.spatialGridCells = count;
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Get average metrics
  getAverageMetrics() {
    if (this.history.length === 0) {
      return this.metrics;
    }

    const sum = this.history.reduce((acc, metrics) => {
      Object.keys(metrics).forEach(key => {
        acc[key] = (acc[key] || 0) + metrics[key];
      });
      return acc;
    }, {});

    const count = this.history.length;
    const average = {};
    Object.keys(sum).forEach(key => {
      average[key] = sum[key] / count;
    });

    return average;
  }

  // Get performance report
  getPerformanceReport() {
    const current = this.getMetrics();
    const average = this.getAverageMetrics();

    return {
      current,
      average,
      performance: {
        fps: 1000 / average.updateTime,
        collisionChecksPerFrame: average.collisionChecks,
        collisionResolutionsPerFrame: average.collisionResolutions,
        entitiesPerFrame: average.entityCount,
      },
    };
  }
}
```

## Physics Configuration

### Default Physics Settings

```javascript
// apps/server/src/physics/config.js
const PHYSICS_CONFIG = {
  // World settings
  gravity: { x: 0, y: 0 },
  airResistance: 0.98,
  maxVelocity: 500,
  timeStep: 1 / 60,
  maxSubSteps: 5,

  // Spatial partitioning
  spatialGrid: {
    cellSize: 64,
    worldBounds: { width: 2000, height: 2000 },
  },

  // Collision groups
  collisionGroups: [
    "players",
    "obstacles",
    "powerups",
    "projectiles",
    "boundaries",
  ],

  // Collision matrix
  collisionMatrix: {
    "players:players": true,
    "players:obstacles": true,
    "players:powerups": true,
    "players:projectiles": true,
    "players:boundaries": true,
    "obstacles:obstacles": false,
    "obstacles:powerups": false,
    "obstacles:projectiles": true,
    "obstacles:boundaries": false,
    "powerups:powerups": false,
    "powerups:projectiles": false,
    "powerups:boundaries": false,
    "projectiles:projectiles": false,
    "projectiles:boundaries": true,
  },

  // Entity defaults
  entityDefaults: {
    player: {
      mass: 10.0,
      restitution: 0.8,
      friction: 0.2,
      maxSpeed: 200,
      acceleration: 800,
    },
    obstacle: {
      mass: Infinity,
      restitution: 0.0,
      friction: 0.5,
      isStatic: true,
    },
    powerup: {
      mass: 1.0,
      restitution: 0.5,
      friction: 0.1,
      isStatic: false,
    },
    projectile: {
      mass: 2.0,
      restitution: 0.3,
      friction: 0.05,
      isStatic: false,
    },
  },
};

module.exports = PHYSICS_CONFIG;
```

This comprehensive physics system provides robust collision detection, efficient spatial partitioning, and flexible entity management for the Bumper Vehicles game, ensuring smooth and accurate physics simulation in real-time multiplayer environments.
