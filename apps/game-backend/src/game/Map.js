import { BlockEntity } from "../game_entities/BlockEntity.js";
import { BouncyBall } from "../game_entities/BouncyBall.js";
import { CheckpointEntity } from "../game_entities/CheckpointEntity.js";
import { FinishPortalEntity } from "../game_entities/FinishPortalEntity.js";
import { LazerEntity } from "../game_entities/LazerEntity.js";
import { Vec2 } from "../utils/vector.js";
import { TileMap } from "../physics/TileMap.js";

class MapManager {
  static defaultMaps = {
    race: "example-race-map",
    battle: "example-battle-race",
  };

  constructor() {
    this.maps = {
      race: {},
      battle: {},
    };

    this.entity_map = new Map();
    this.entity_map.set("block", BlockEntity);
    this.entity_map.set("bouncy_ball", BouncyBall);
    this.entity_map.set("checkpoint", CheckpointEntity);
    this.entity_map.set("finish_portal", FinishPortalEntity);
    this.entity_map.set("lazer", LazerEntity);
  }

  createScript(type, name, script) {
    this.maps[type][name] = script;
  }

  // FUTURE FEATURE
  // load map from database / JSON file
  loadMap() {}

  // gets constructor from the name
  getConstructor(name) {
    return this.entity_map.get(name);
  }

  // returns scrip
  getMapScript(type, name) {
    const script = this.maps[type][name];
    if (!script) return null;

    // Handle both old array format and new object format for backward compatibility
    if (Array.isArray(script)) {
      // Old format - return just the entities array
      return {
        dimensions: null,
        entities: script.map(instruction => ({
          type: instruction.type,
          parameters: {
            ...instruction.parameters,
            position: instruction.parameters.position
              ? instruction.parameters.position.copy()
              : undefined,
          },
        })),
      };
    } else {
      // New format - return both dimensions and entities
      return {
        dimensions: script.dimensions,
        entities: script.entities.map(instruction => ({
          type: instruction.type,
          parameters: {
            ...instruction.parameters,
            position: instruction.parameters.position
              ? instruction.parameters.position.copy()
              : undefined,
          },
        })),
      };
    }
  }

  getDefaultMap(type) {
    return MapManager.defaultMaps[type];
  }

  // Get map dimensions from a map script
  getMapDimensions(type, name) {
    const script = this.maps[type][name];
    if (!script) return null;

    if (Array.isArray(script)) {
      // Old format - no explicit dimensions
      return null;
    } else {
      // New format - return dimensions
      return script.dimensions;
    }
  }
}

// singleton instance
const mapManager = new MapManager();

const gs = TileMap.getGridSize();

const script = {
  dimensions: {
    width: gs * 40, // 40 grid units wide
    height: gs * 21, // 20 grid units tall
  },
  entities: [
    // Spawn points for 5 players
    { type: "spawn_point", parameters: { position: new Vec2(gs * 2, gs * 2) } },
    { type: "spawn_point", parameters: { position: new Vec2(gs * 3, gs * 2) } },
    // { type: "spawn_point", parameters: { position: new Vec2(gs * 4, gs * 2) } },
    // { type: "spawn_point", parameters: { position: new Vec2(gs * 5, gs * 2) } },
    // { type: "spawn_point", parameters: { position: new Vec2(gs * 6, gs * 2) } },

    // Checkpoints
    {
      type: "checkpoint",
      parameters: { position: new Vec2(gs * 15, gs * 8), checkpointId: 1 },
    },
    {
      type: "checkpoint",
      parameters: { position: new Vec2(gs * 25, gs * 15), checkpointId: 2 },
    },

    // Finish portal
    {
      type: "finish_portal",
      parameters: { position: new Vec2(gs * 35, gs * 10) },
    },

    // Test lazers
    {
      type: "lazer",
      parameters: {
        position: new Vec2(gs * 10, gs * 6),
        orientation: "horizontal",
        length: 8,
      },
    },
    {
      type: "lazer",
      parameters: {
        position: new Vec2(gs * 20, gs * 13),
        orientation: "vertical",
        length: 6,
      },
    },
    {
      type: "lazer",
      parameters: {
        position: new Vec2(gs * 30, gs * 9),
        orientation: "horizontal",
        length: 6,
      },
    },
  ],
};

// Outer walls - much larger track
// Top wall
for (let i = 0; i < 40; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * i, 0), size: new Vec2(gs, gs) },
  });
}

// Bottom wall
for (let i = 0; i < 40; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * i, gs * 20), size: new Vec2(gs, gs) },
  });
}

// Left wall
for (let i = 1; i < 20; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(0, gs * i), size: new Vec2(gs, gs) },
  });
}

// Right wall
for (let i = 1; i < 20; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * 39, gs * i), size: new Vec2(gs, gs) },
  });
}

// Inner maze walls
// Horizontal walls
for (let i = 5; i < 15; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * i, gs * 5), size: new Vec2(gs, gs) },
  });
}
for (let i = 20; i < 30; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * i, gs * 10), size: new Vec2(gs, gs) },
  });
}
for (let i = 10; i < 25; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * i, gs * 15), size: new Vec2(gs, gs) },
  });
}

// Vertical walls
for (let i = 6; i < 12; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * 8, gs * i), size: new Vec2(gs, gs) },
  });
}
for (let i = 8; i < 18; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * 18, gs * i), size: new Vec2(gs, gs) },
  });
}
for (let i = 3; i < 8; i++) {
  script.entities.push({
    type: "block",
    parameters: { position: new Vec2(gs * 28, gs * i), size: new Vec2(gs, gs) },
  });
}

// Some bouncy balls for obstacles
script.entities.push({
  type: "bouncy_ball",
  parameters: { position: new Vec2(gs * 12, gs * 7), radius: gs / 2 },
});
script.entities.push({
  type: "bouncy_ball",
  parameters: { position: new Vec2(gs * 22, gs * 12), radius: gs / 2 },
});
script.entities.push({
  type: "bouncy_ball",
  parameters: { position: new Vec2(gs * 32, gs * 8), radius: gs / 2 },
});

mapManager.createScript("race", "example-race-map", script);

export default mapManager;
