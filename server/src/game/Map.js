import { BlockEntity } from './BlockEntity.js';
import { Vec2 } from '../utils/vector.js';

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

mapManager.createScript('race', 'example-race-map', [
  { type: 'spawn_point', parameters: { position: new Vec2(500, 300) } },
  { type: 'spawn_point', parameters: { position: new Vec2(200, 300) } },
  { type: 'block', parameters: { position: new Vec2(50, 50), size: new Vec2(50, 50) } },
  { type: 'block', parameters: { position: new Vec2(150, 50), size: new Vec2(50, 50) } }
]);

export default mapManager;