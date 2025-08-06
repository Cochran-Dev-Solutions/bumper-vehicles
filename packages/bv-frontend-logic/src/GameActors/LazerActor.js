import StaticActor from "./StaticActor.js";

class LazerActor extends StaticActor {
  constructor(config) {
    super({ ...config });

    // Safety defaults for lazer-specific properties
    this.orientation = config.orientation || "horizontal";
    this.length = config.length || 8;

    // Lazer line properties with defaults
    this.lazerPosition = config.lazerPosition || { x: 0, y: 0 };
    this.lazerSize = config.lazerSize || { x: 800, y: 4 };

    // Emitter properties with defaults
    this.emitter1Position = config.emitter1Position || { x: 0, y: 0 };
    this.emitter2Position = config.emitter2Position || { x: 0, y: 0 };
    this.emitterSize = config.emitterSize || { x: 15, y: 100 };
  }

  updateState(newState) {
    super.updateState(newState);

    // Update lazer-specific properties if provided
    if (newState.orientation !== undefined)
      this.orientation = newState.orientation;
    if (newState.length !== undefined) this.length = newState.length;
    if (newState.lazerPosition !== undefined)
      this.lazerPosition = newState.lazerPosition;
    if (newState.lazerSize !== undefined) this.lazerSize = newState.lazerSize;
    if (newState.emitter1Position !== undefined)
      this.emitter1Position = newState.emitter1Position;
    if (newState.emitter2Position !== undefined)
      this.emitter2Position = newState.emitter2Position;
    if (newState.emitterSize !== undefined)
      this.emitterSize = newState.emitterSize;
  }

  display() {
    if (
      !this.emitter1Position ||
      !this.emitter2Position ||
      !this.emitterSize ||
      !this.lazerPosition ||
      !this.lazerSize
    ) {
      console.warn("LazerActor: Missing required properties for rendering");
      return;
    }

    // Draw lazer (yellow line/rectangle)
    this.p.push();
    this.p.fill(255, 255, 0); // Yellow color
    this.p.noStroke();
    this.p.rect(
      this.lazerPosition.x || 0,
      this.lazerPosition.y || 0,
      this.lazerSize.x || 0,
      this.lazerSize.y || 0
    );
    this.p.pop();

    // Draw emitters (grey rectangles)
    this.p.push();
    this.p.fill(128); // Grey color
    this.p.noStroke();
    this.p.rect(
      this.emitter1Position.x || 0,
      this.emitter1Position.y || 0,
      this.emitterSize.x || 0,
      this.emitterSize.y || 0
    );
    this.p.rect(
      this.emitter2Position.x || 0,
      this.emitter2Position.y || 0,
      this.emitterSize.x || 0,
      this.emitterSize.y || 0
    );
    this.p.pop();
  }
}

export default LazerActor;
