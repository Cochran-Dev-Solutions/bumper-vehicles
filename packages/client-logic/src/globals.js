// In globals.js
const gameInfo = {
  initial_game_state: null,
  game_type: null,
  player_id: null,
  socket_id: null,
};

function updateGameInfo(newInfo) {
  Object.assign(gameInfo, newInfo);
}

let currentPublicUser = null;

function updateCurrentPublicUser(username) {
  currentPublicUser = username;
}

// Global GameRenderer instance
let globalGameRenderer = null;

// Platform-agnostic image loader
let loadImageAsync = async () => { throw new Error("loadImageAsync not implemented"); };
function setLoadImageAsync(fn) { loadImageAsync = fn; }

export {
  gameInfo,
  updateGameInfo,
  currentPublicUser,
  updateCurrentPublicUser,
  globalGameRenderer,
  loadImageAsync,
  setLoadImageAsync,
};
