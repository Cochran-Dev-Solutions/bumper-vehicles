import socket from "../networking/socket.js";
import { PlayerActor } from "../GameActors/PlayerActor.js";
import { BlockActor } from './BlockActor.js';
import { BouncyBallActor } from './BouncyBallActor.js';

function showReconnectingOverlay() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.padding = '20px';
  container.style.borderRadius = '10px';
  container.style.color = 'white';
  container.style.textAlign = 'center';
  container.style.zIndex = '2000';
  container.id = 'reconnecting-overlay';

  const title = document.createElement('h2');
  title.textContent = 'Reconnecting...';
  title.style.marginBottom = '20px';

  const spinner = document.createElement('div');
  spinner.style.border = '4px solid #f3f3f3';
  spinner.style.borderTop = '4px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.margin = '0 auto 20px';

  // Add the spinning animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  container.appendChild(title);
  container.appendChild(spinner);
  document.body.appendChild(container);
}

function hideReconnectingOverlay() {
  const overlay = document.getElementById('reconnecting-overlay');
  if (overlay) {
    overlay.remove();
  }
}

class GameRenderer {
  constructor() {
    this.actors = [];
    this.id_actor_map = new Map();
    this.type_actor_map = new Map([
      ['block', BlockActor],
      ['bouncy_ball', BouncyBallActor]
    ]);

    // initalized on setup
    this.p = null; // p5.js instance
    this.localPlayer = null;
    this.game_type = null;
    this.socket_id = null; // for syncing with back-end
    this.player_id = null; // for syncing with back-end

    // for reconnecting if server connection gets interrupted
    this.reconnect_attempts = 0;
    this.max_reconnect_attempts = 5;
    this.reconnect_interval = 1000; // 1 second
    this.ableToReconnect = true;
  }

  async setup(p5Instance, gameInfo) {
    this.p = p5Instance;
    this.game_type = gameInfo.game_type;
    this.socket_id = gameInfo.socket_id;
    this.player_id = gameInfo.player_id;

    // Create players
    gameInfo.initial_game_state.players.forEach(player => {
      const newPlayer = new PlayerActor({
        p: this.p,
        isLocalPlayer: (player.id === this.player_id),
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
        id: player.id,
        socket_id: this.socket_id
      });
      if (player.id === this.player_id) {
        this.localPlayer = newPlayer;
      }
      this.actors.push(newPlayer);
      this.id_actor_map.set(player.id, newPlayer);
    });

    // Create passive actors
    gameInfo.initial_game_state.passive_actors.forEach(actor => {
      const ActorClass = this.type_actor_map.get(actor.type);
      if (ActorClass) {
        const newActor = new ActorClass({
          p: this.p,
          x: actor.x,
          y: actor.y,
          width: actor.width,
          height: actor.height,
          id: actor.id
        });
        this.actors.push(newActor);
        this.id_actor_map.set(actor.id, newActor);
      } else {
        console.warn(`Unknown actor type: ${actor.type}`);
      }
    });

    // Load necessary images used for actors
    await Promise.all(this.actors.map(actor => actor.loadImages()));

    socket.on('gameState', (state) => {
      this.updateState(state);
    });

    socket.on('playerRemoved', ({ playerId }) => {
      this.removePlayer(playerId);
    });

    socket.on('disconnect', () => {
      if (this.ableToReconnect) {
        this.attemptReconnect();
      }
    });

    socket.on('reconnect:success', (data) => {
      console.log('Reconnection successful:', data);
      hideReconnectingOverlay();
      this.ableToReconnect = true;
    });
  }

  update() {
    this.actors.forEach(actor => actor.update());
  }

  async reinitializeGame() {
    try {
      // Connect to the socket
      await socket.connect();
      this.socket_id = socket.id;

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        socket.connected = false;
        if (this.ableToReconnect) {
          this.attemptReconnect();
        }
      });

      // Set up error handling
      socket.on('connect-error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      socket.on('reconnect:success', () => {
        //console.log('Reconnection successful');
        hideReconnectingOverlay();
      });

      socket.on('gameState', (state) => {
        this.updateState(state);
      });

      socket.on('playerRemoved', ({ playerId }) => {
        this.removePlayer(playerId);
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      return false;
    }
  }

  attemptReconnect() {
    if (this.reconnect_attempts >= this.max_reconnect_attempts) {
      console.log('Max reconnect attempts reached, returning to menu');
      socket.emit('player:delete', this.player_id);
      hideReconnectingOverlay();
      this.ableToReconnect = false;
      return;
    }

    showReconnectingOverlay();
    this.reconnect_attempts++;
    console.log(`Attempting to reconnect (${this.reconnect_attempts}/${this.max_reconnect_attempts})...`);

    setTimeout(async () => {
      try {
        if (!socket.connected) {
          if (this.player_id) {
            console.log('Socket connected, attempting to reconnect to game with playerId:', this.player_id);
            // Reinitialize the game with the same game type
            await this.reinitializeGame();
            // After initialization, send the reconnect request
            socket.emit('player:reconnect', this.player_id);
          }
        }
      } catch {
        this.attemptReconnect();
      }
    }, this.reconnect_interval);
  }

  updateState(state) {
    Object.values(state.actors).forEach(actorState => {
      const actor = this.id_actor_map.get(actorState.id);
      if (actor) actor.updateState(actorState)
    });
  }

  /**
   * Remove a player from the game
   * @param {string} playerId - The ID of the player to remove
   */
  removePlayer(playerId) {
    const actor = this.id_actor_map.get(playerId);
    if (actor) {
      // Remove from actors array
      const index = this.actors.indexOf(actor);
      if (index > -1) {
        this.actors.splice(index, 1);
      }

      // Remove from id_actor_map
      this.id_actor_map.delete(playerId);

      console.log(`Player ${playerId} removed from game`);
    }
  }
}

const gameRenderer = new GameRenderer();
export default gameRenderer;