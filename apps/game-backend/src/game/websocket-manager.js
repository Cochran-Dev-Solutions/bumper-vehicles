import { Server } from "socket.io";
import Game from "./Game.js";

class WebSocketManager {
  constructor() {
    this.io = null;
    this.active_games = [];
    this.games_in_queue = {};
    this.player_game_map = new Map();
    this.socket_game_map = new Map();
    this.PHYSICS_UPDATE_INTERVAL = 1000 / 60;
    this.physicsInterval = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? false
            : ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.setupSocketHandlers();
    this.startPhysicsLoop();
    console.log("WebSocketManager initialized");
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log("New client connected");

      // Player reconnect
      socket.on("player:reconnect", (playerId) => {
        const game = this.player_game_map.get(playerId);
        if (game && game.state === "playing") {
          const player = game.getPlayerByPlayerId(playerId);
          if (player) {
            game.handleReconnect(socket.id, player.id);
            socket.emit("reconnect:success");
            socket.emit("gameState", game.getState());
          }
        } else {
          socket.emit("game_not_found");
        }
      });

      // Player delete
      socket.on("player:delete", (playerId) => {
        const game = this.player_game_map.get(playerId);
        if (game) game.removePlayer(socket.id);
        this.socket_game_map.delete(socket.id);
        this.player_game_map.delete(playerId);
        socket.disconnect();
      });

      // Player join
      socket.on("player:join:event", (data) => {
        const gameType = data.gameType;
        const userData = data.userData;
        let game = this.games_in_queue[gameType];
        if (!game) {
          game = new Game({ type: gameType });
          this.games_in_queue[gameType] = game;
        }
        const playerId = this.generateUniquePlayerId();
        const shouldStartGame = game.addPlayer(socket, userData, playerId);
        this.player_game_map.set(playerId, game);
        this.socket_game_map.set(socket.id, game);
        socket.emit("player-id", playerId);

        if (shouldStartGame) {
          this.games_in_queue[gameType] = null;
          game.state = "playing";
          this.active_games.push(game);
          game.start(this.io);
        } else {
          socket.emit("waitingRoom", {
            currentPlayers: game.getPlayerCount(),
            requiredPlayers: game.requiredPlayers,
          });
        }
      });

      // Player input
      socket.on("playerInput", (data) => {
        const game = this.player_game_map.get(data.playerId);
        if (game) {
          const player = game.getPlayerBySocketId(socket.id);
          if (player) {
            player.updateInput(data.input);
          }
        } else {
          socket.emit("game_not_found");
          socket.disconnect();
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        const game = this.socket_game_map.get(socket.id);
        if (game) {
          if (game.state === "playing") {
            game.handleDisconnect(socket.id, this.io);
            this.socket_game_map.delete(socket.id);
          } else {
            const player = game.getPlayerBySocketId(socket.id);
            if (player) {
              const playerId = player.id;
              game.removePlayer(socket.id);
              this.socket_game_map.delete(socket.id);
              this.player_game_map.delete(playerId);
              game.players.forEach((_, socketId) => {
                this.io.to(socketId).emit("playerRemoved", { playerId });
              });
            }
          }
        }
      });
    });
  }

  startPhysicsLoop() {
    this.physicsInterval = setInterval(() => {
      for (let i = this.active_games.length - 1; i >= 0; i--) {
        const game = this.active_games[i];
        game.update(this.io);
        if (game.state === "inactive") {
          this.active_games.splice(i, 1);
        }
      }
    }, this.PHYSICS_UPDATE_INTERVAL);
  }

  stopPhysicsLoop() {
    if (this.physicsInterval) clearInterval(this.physicsInterval);
    this.physicsInterval = null;
  }

  generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  generateUniquePlayerId() {
    let playerId;
    do {
      playerId = this.generateRandomString(10);
    } while (this.player_game_map.has(playerId));
    return playerId;
  }

  shutdown() {
    this.stopPhysicsLoop();
    if (this.io) this.io.close();
    this.active_games = [];
    this.games_in_queue = {};
    this.player_game_map.clear();
    this.socket_game_map.clear();
    console.log("WebSocketManager shutdown complete");
  }
}

const webSocketManager = new WebSocketManager();
export default webSocketManager;
