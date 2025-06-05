import socket from "../networking/socket.js";
import { PlayerActor } from "../GameActors/PlayerActor.js";

class GameRenderer {
  constructor() {
    this.actors = [];

    // initalized on setup
    this.p = null; // p5.js instance
    this.localPlayer = null;
    this.game_type = null;
    this.socket_id = null; // for syncing with back-end
    this.player_id = null; // for syncing with back-end
  }

  setup(p5Instance, gameInfo) {
    console.log("Testing initial game state in GameRenderer: ", gameInfo.initial_game_state);
    this.p = p5Instance;
    this.game_type = gameInfo.game_type;
    this.socket_id = gameInfo.socket_id;
    this.player_id = gameInfo.player_id;

    const setup = gameInfo.initial_game_state;

    // Create players
    Object.entries(gameInfo.initial_game_state.players).forEach((entry) => {
      const socket_id = entry[0],
        player = entry[1];

      const newPlayer = new PlayerActor({
        p: p5Instance,
        isLocalPlayer: (player.playerId === this.player_id) ? true : false,
        x: player.x,
        y: player.y,
        player_id: this.player_id,
        socket_id: this.socket_id
      });
      if (player.playerId === this.player_id) {
        this.localPlayer = newPlayer;
      }
      this.actors.push(this.localPlayer);
    });

    // Create other actors
    // TODO
  }

  update() {
    this.actors.forEach(actor => actor.update());
  }

  attemptReconnect() {

  }
}

const gameRenderer = new GameRenderer();
export default gameRenderer;