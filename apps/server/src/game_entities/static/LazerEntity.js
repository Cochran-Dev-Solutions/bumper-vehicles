import { StaticEntity } from "../StaticEntity.js";
import { Vec2 } from "../../utils/vector.js";
import { BoundingBox } from "../../physics/BoundingBox.js";

export class LazerEntity extends StaticEntity {
  constructor(config) {
    super({ ...config, type: "lazer" });

    this.orientation = config.orientation; // "horizontal" or "vertical"
    this.length = config.length; // Length of the lazer in tiles (not pixels)

    // define constants
    const tileSize = this.tileMap
      ? this.tileMap.constructor.getGridSize()
      : null;
    const emitterThickness = 15;
    const lazerWidth = 4;

    // size --> bounding box around the lazer (in terms of tile spaces it occupies)
    if (this.orientation === "horizontal") {
      this.size = new Vec2(this.length * tileSize, tileSize);
    } else {
      this.size = new Vec2(tileSize, this.length * tileSize);
    }
    this.boundingBox = new BoundingBox(this);

    // Define lazer size and position
    if (this.orientation === "horizontal") {
      this.lazerSize = new Vec2(this.length * tileSize, lazerWidth);
      this.lazerPosition = new Vec2(
        this.position.x,
        this.position.y + this.size.y / 2 - lazerWidth / 2
      );
    } else {
      this.lazerSize = new Vec2(lazerWidth, this.length * tileSize);
      this.lazerPosition = new Vec2(
        this.position.x + this.size.x / 2 - lazerWidth / 2,
        this.position.y
      );
    }

    // Define emitter size and positions directly in constructor
    if (this.orientation === "horizontal") {
      this.emitterSize = new Vec2(emitterThickness, tileSize);
      this.emitter1Position = new Vec2(this.position.x, this.position.y);
      this.emitter2Position = new Vec2(
        this.position.x + this.size.x,
        this.position.y
      );
    } else {
      this.emitterSize = new Vec2(tileSize, emitterThickness);
      this.emitter1Position = new Vec2(this.position.x, this.position.y);
      this.emitter2Position = new Vec2(
        this.position.x,
        this.position.y + this.size.y
      );
    }
  }

  /**
   * Check if a player collides with the lazer or emitters
   * @param {PlayerEntity} player - The player entity to check
   * @returns {boolean} True if collision detected
   */
  checkCollision(player) {
    // First check if the player's bounding box intersects with the lazer's bounding box
    if (!this.boundingBox.intersects(player.boundingBox)) {
      return false;
    }

    // Check emitter collisions (treat as solid blocks) - handle bounce physics
    if (this.handleEmitterCollision(player)) {
      return false; // Return false so player doesn't lose life, just bounces
    }

    // If no emitter collision, check lazer line collision
    const point = new Vec2(
      player.position.x + player.radius,
      player.position.y + player.radius
    ); // Player center
    const radius = player.radius;

    // Treat lazer as a rectangle and find closest point on rectangle to circle center
    const lazerLeft = this.lazerPosition.x;
    const lazerRight = this.lazerPosition.x + this.lazerSize.x;
    const lazerTop = this.lazerPosition.y;
    const lazerBottom = this.lazerPosition.y + this.lazerSize.y;

    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(lazerLeft, Math.min(point.x, lazerRight));
    const closestY = Math.max(lazerTop, Math.min(point.y, lazerBottom));

    // Calculate distance from circle center to closest point on rectangle
    const distanceX = point.x - closestX;
    const distanceY = point.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Check if distance is less than or equal to circle radius
    return distance <= radius;
  }

  /**
   * Handle collision with emitters (treat as solid blocks with bounce physics)
   * @param {PlayerEntity} player - The player entity to check
   * @returns {boolean} True if collision detected and handled with any emitter
   */
  handleEmitterCollision(player) {
    // Create emitter objects with position and size for handleBlockCollision
    const emitter1 = {
      position: this.emitter1Position,
      size: this.emitterSize,
    };

    const emitter2 = {
      position: this.emitter2Position,
      size: this.emitterSize,
    };

    // Check collision with emitter 1
    if (player.handleBlockCollision(emitter1)) {
      return true;
    }

    // Check collision with emitter 2
    if (player.handleBlockCollision(emitter2)) {
      return true;
    }

    return false;
  }

  getInitialState() {
    return {
      id: this.id,
      type: this.type,
      type_of_actor: this.type_of_actor,
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y,
      orientation: this.orientation,
      length: this.length,
      lazerPosition: {
        x: this.lazerPosition.x,
        y: this.lazerPosition.y,
      },
      lazerSize: {
        x: this.lazerSize.x,
        y: this.lazerSize.y,
      },
      emitter1Position: {
        x: this.emitter1Position.x,
        y: this.emitter1Position.y,
      },
      emitter2Position: {
        x: this.emitter2Position.x,
        y: this.emitter2Position.y,
      },
      emitterSize: {
        x: this.emitterSize.x,
        y: this.emitterSize.y,
      },
    };
  }

  getUpdatedState() {
    // Lazer is static and doesn't change state
    return null;
  }
}
