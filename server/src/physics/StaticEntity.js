import { Vec2 } from '../utils/vector.js';
import { Entity } from './Entity.js';

export class StaticEntity extends Entity {
  constructor(config) {
    super({ ...config, hasUpdate: false });
  }
} 