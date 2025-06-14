import { BlockEntity } from '../game_entities/BlockEntity.js';
import { BouncyBall } from '../game_entities/BouncyBall.js';
import { Vec2 } from '../utils/vector.js';
import { TileMap } from '../physics/TileMap.js';

class MapManager {
  static defaultMaps = {
    'race': 'example-race-map',
    'battle': 'example-battle-race'
  };

  constructor() {
    this.maps = {
      'race': {},
      'battle': {}
    };

    this.entity_map = new Map();
    this.entity_map.set('block', BlockEntity);
    this.entity_map.set('bouncy_ball', BouncyBall);
  }

  createScript(type, name, script) {
    this.maps[type][name] = script;
  }

  // FUTURE FEATURE
  // load map from database / JSON file
  loadMap() {

  }

  // gets constructor from the name
  getConstructor(name) {
    return this.entity_map.get(name);
  }

  // returns scrip
  getMapScript(type, name) {
    return this.maps[type][name];
  }

  getDefaultMap(type) {
    return MapManager.defaultMaps[type];
  }
}

// singleton instance
const mapManager = new MapManager();

const gs = TileMap.getGridSize();

mapManager.createScript('race', 'example-race-map', [
  { type: 'spawn_point', parameters: { position: new Vec2(500, 300) } },
  { type: 'spawn_point', parameters: { position: new Vec2(200, 300) } },
  { type: 'block', parameters: { position: new Vec2(gs * 2, gs * 1), size: new Vec2(gs, gs) } },
  { type: 'block', parameters: { position: new Vec2(gs * 4, gs * 1), size: new Vec2(gs, gs) } },
  { type: 'bouncy_ball', parameters: { position: new Vec2(gs * 3, gs * 2), radius: gs / 2 } },
  { type: 'bouncy_ball', parameters: { position: new Vec2(gs * 8, gs * 2), radius: gs / 2 } }
]);

export default mapManager;