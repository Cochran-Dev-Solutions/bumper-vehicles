export class TileMap {
  static gridSize = 100;

  constructor() {
    this.collision_maps = {};
  }

  static getGridSize() {
    return TileMap.gridSize;
  }

  /**
   * Get the tile key for a given position
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {string} - tile key in format "x,y"
   */
  getTileKey(x, y) {
    const gridX = Math.floor(x / TileMap.getGridSize());
    const gridY = Math.floor(y / TileMap.getGridSize());
    return `${gridX},${gridY}`;
  }

  /**
   * Get an entity at a specific position
   * @param {string} type - type of entity (e.g. 'block')
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {Object|null} - entity at position or null if none exists
   */
  getEntityAt(type, x, y) {
    if (!this.collision_maps[type]) return null;
    const tileKey = this.getTileKey(x, y);
    return this.collision_maps[type][tileKey] || null;
  }

  /**
   * Check if an entity exists at a specific position
   * @param {string} type - type of entity (e.g. 'block')
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {boolean} - true if entity exists at position
   */
  hasEntityAt(type, x, y) {
    return this.getEntityAt(type, x, y) !== null;
  }

  /**
   * Check if a position aligns with the grid
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {boolean} - true if position aligns with grid
   */
  isAlignedWithGrid(x, y) {
    return x % TileMap.getGridSize() === 0 && y % TileMap.getGridSize() === 0;
  }

  /**
   * Add an entity to the tile map
   * @param {string} type - type of entity (e.g. 'block')
   * @param {Object} entity - entity to add
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   */
  addEntity(type, entity, x, y) {
    if (!this.collision_maps[type]) {
      this.collision_maps[type] = {};
    }
    const tileKey = this.getTileKey(x, y);
    this.collision_maps[type][tileKey] = entity;
  }

  /**
   * Remove an entity from the tile map
   * @param {string} type - type of entity (e.g. 'block')
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   */
  removeEntity(type, x, y) {
    if (!this.collision_maps[type]) return;
    const tileKey = this.getTileKey(x, y);
    delete this.collision_maps[type][tileKey];
  }

  /**
   * Get all tiles of a specific type that an entity's bounding box is colliding with
   * @param {string} type - type of entity (e.g. 'block')
   * @param {BoundingBox} boundingBox - the entity's bounding box
   * @returns {Array} - array of colliding tile entities
   */
  getCollidingTiles(type, boundingBox) {
    if (!this.collision_maps[type]) return [];

    const collidingTiles = [];

    // Calculate the grid cells that the bounding box overlaps
    const startX = Math.floor(boundingBox.left / TileMap.getGridSize());
    const endX = Math.floor(boundingBox.right / TileMap.getGridSize());
    const startY = Math.floor(boundingBox.top / TileMap.getGridSize());
    const endY = Math.floor(boundingBox.bottom / TileMap.getGridSize());

    // Check each grid cell for a tile
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const tileKey = `${x},${y}`;
        const tile = this.collision_maps[type][tileKey];
        if (tile) {
          collidingTiles.push(tile);
        }
      }
    }

    // Filter tiles to only include those that actually intersect with the bounding box
    return collidingTiles;
  }
} 