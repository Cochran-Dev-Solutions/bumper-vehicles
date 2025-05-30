import p5 from 'p5';
import socket from './socket.js';
import keyManager from './EventObjects/KeyManager.js';

// Game state
let gameState = {
  players: {},
  localPlayer: null
};

// Input update interval (60fps)
const INPUT_UPDATE_INTERVAL = 1000 / 60;
let lastInputUpdate = 0;

async function initializeSocket() {
  try {
    // Connect to the socket
    await socket.connect();

    // Create a promise that resolves when the socket connects
    await new Promise((resolve) => {
      socket.on('connect', () => {
        gameState.localPlayer = socket.id;
        console.log('Connected with ID:', gameState.localPlayer);
        resolve();
      });
    });

    // Set up socket event handlers
    socket.on('gameState', (state) => {
      gameState.players = state.players;
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return true;
  } catch (error) {
    console.error('Failed to connect to socket:', error);
    return false;
  }
}

// Create a new sketch
const sketch = (p) => {
  let socketInitialized = false;

  p.setup = async () => {
    p.createCanvas(800, 600);
    p.background(51);

    // Register arrow keys
    keyManager.register('up', 'ArrowUp');
    keyManager.register('down', 'ArrowDown');
    keyManager.register('left', 'ArrowLeft');
    keyManager.register('right', 'ArrowRight');

    // Initialize socket connection
    socketInitialized = await initializeSocket();
  };

  p.draw = () => {
    p.background(51);

    // Only proceed with game logic if socket is initialized
    if (!socketInitialized) {
      p.fill(255);
      p.text('Connecting...', p.width / 2 - 50, p.height / 2);
      return;
    }

    // Create input object
    const input = {
      up: keyManager.pressed('up'),
      down: keyManager.pressed('down'),
      left: keyManager.pressed('left'),
      right: keyManager.pressed('right')
    };

    // Send input to server at fixed intervals
    const currentTime = Date.now();
    if (currentTime - lastInputUpdate >= INPUT_UPDATE_INTERVAL) {
      socket.emit('playerInput', input);
      lastInputUpdate = currentTime;
    }

    // Draw all players
    Object.values(gameState.players).forEach(player => {
      if (player.id === gameState.localPlayer) {
        p.fill(255);
        p.rect(player.x, player.y, 30, 30);
      } else {
        p.fill(player.color);
        p.ellipse(player.x, player.y, 30, 30);
      }
    });
  };

  p.keyPressed = (event) => {
    keyManager.keyPressed(event.key);
  };

  p.keyReleased = (event) => {
    keyManager.keyReleased(event.key);
  };
};

// Create new p5 instance with our sketch
new p5(sketch);