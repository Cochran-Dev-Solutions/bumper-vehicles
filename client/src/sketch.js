import socket from './socket.js';
import KeyManager from './EventObjects/KeyManager.js';

// Game state
let gameState = {
  players: {},
  localPlayer: null
};

// Create a new sketch
const sketch = (p) => {
  let keyManager;
  let playerX = 400;
  let playerY = 300;
  const moveSpeed = 5;

  p.setup = () => {
    p.createCanvas(800, 600);
    p.background(51);

    // Initialize key manager
    keyManager = new KeyManager();

    // Register arrow keys
    keyManager.register('up', 'ArrowUp');
    keyManager.register('down', 'ArrowDown');
    keyManager.register('left', 'ArrowLeft');
    keyManager.register('right', 'ArrowRight');

    // Initialize socket connection
    socket.connect();

    // Set up socket event handlers
    socket.on('gameState', (state) => {
      gameState.players = state.players;
    });
  };

  p.draw = () => {
    p.background(51);

    // Handle movement
    if (keyManager.pressed('up')) playerY -= moveSpeed;
    if (keyManager.pressed('down')) playerY += moveSpeed;
    if (keyManager.pressed('left')) playerX -= moveSpeed;
    if (keyManager.pressed('right')) playerX += moveSpeed;

    // Draw local player
    p.fill(255);
    p.rect(playerX, playerY, 30, 30);

    // Draw other players
    Object.values(gameState.players).forEach(player => {
      p.fill(player.color);
      p.ellipse(player.x, player.y, 30, 30);
    });
  };

  p.keyPressed = () => {
    keyManager.keyPressed(p.key);
  };

  p.keyReleased = () => {
    keyManager.keyReleased(p.key);
  };
};

// Create new p5 instance with our sketch
new p5(sketch);

// Export the gameState so it can be accessed from main.js
export { gameState }; 