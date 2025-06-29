import { Entity } from "./Entity.js";

export class StaticEntity extends Entity {
  constructor(config) {
    super({ ...config, hasUpdate: false });
  }
} 