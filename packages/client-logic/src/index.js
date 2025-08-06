// Event Management (Singletons)
export { default as sceneManager } from "./core/event-management/SceneManager.js";
export { default as mouse } from "./core/event-management/MouseManager.js";
export { default as keyManager } from "./core/event-management/KeyManager.js";
export { default as timeManager } from "./core/event-management/TimeManager.js";
export { default as Button } from "./core/event-management/Button.js";
export { default as InputManager } from "./core/event-management/InputManager.js";

// Core Actors (Classes)
export { default as BouncyBallActor } from "./core/actors/dynamic-actors/BouncyBallActor.js";
export { default as DynamicActor } from "./core/actors/DynamicActor.js";
export { default as GameActor } from "./core/actors/GameActor.js";
export { default as PlayerActor } from "./core/actors/dynamic-actors/PlayerActor.js";
export { default as PowerupActor } from "./core/actors/dynamic-actors/PowerupActor.js";
export { default as StaticActor } from "./core/actors/StaticActor.js";
export { default as BlockActor } from "./core/actors/static-actors/BlockActor.js";
export { default as CheckpointActor } from "./core/actors/static-actors/CheckpointActor.js";
export { default as FinishPortalActor } from "./core/actors/static-actors/FinishPortalActor.js";
export { default as LazerActor } from "./core/actors/static-actors/LazerActor.js";

// Rendering (Classes)
export { default as GameRenderer } from "./core/rendering/GameRenderer.js";
export { default as AnimatedSprite } from "./core/rendering/AnimatedSprite.js";

// Map Scene Tools (Classes)
export { default as MapCharacter } from "./scene-tools/map/MapCharacter.js";
export { default as Camera } from "./scene-tools/map/Camera.js";
export { default as Island } from "./scene-tools/map/Island.js";

// Garage Scene Tools (Classes)
export { default as GarageCharacter } from "./scene-tools/garage/GarageCharacter.js";

// Networking (Singletons)
export { default as ajax } from "./networking/ajax.js";
export { default as socket } from "./networking/socket.js";

// Utils (Classes)
export {
  default as collisions,
  rectToRect,
  rectToCircle,
} from "./utils/collisions.js";

// Globals (Named exports)
export {
  gameInfo,
  updateGameInfo,
  currentPublicUser,
  updateCurrentPublicUser,
  globalGameRenderer,
} from "./globals.js";
export { setLoadImageAsync } from "./globals.js";
