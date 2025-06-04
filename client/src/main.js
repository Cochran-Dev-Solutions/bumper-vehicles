import p5 from 'p5';
import socket from './socket.js';
import keyManager from './EventObjects/KeyManager.js';
import { PlayerController } from './GameEntities/PlayerController.js';

// Game state
let gameState = {
  players: {},
  localPlayer: null,
  playerId: null,
  isGameStarted: false,
  gameType: null,
  waitingRoom: {
    currentPlayers: 0,
    requiredPlayers: 0
  }
};

// Input update interval (60fps)
const INPUT_UPDATE_INTERVAL = 1000 / 60;
let lastInputUpdate = 0;

// Penguin images
let penguinImages = [];
let localPlayerController = null;
let p5Instance = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 1000; // 1 second

function showGameSelectionUI() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  container.style.zIndex = '1000';
  container.id = 'ui-id';

  const raceBtn = document.createElement('button');
  raceBtn.textContent = 'Race';
  raceBtn.style.margin = '10px';
  raceBtn.onclick = () => showGameDescription('race');

  const battleBtn = document.createElement('button');
  battleBtn.textContent = 'Battle';
  battleBtn.style.margin = '10px';
  battleBtn.onclick = () => showGameDescription('battle');

  container.appendChild(raceBtn);
  container.appendChild(battleBtn);
  document.body.appendChild(container);
}

function showGameDescription(gameType) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  container.style.zIndex = '1000';
  container.id = 'gamePanel';

  const description = document.createElement('p');
  description.textContent = gameType === 'race'
    ? 'Race is a competitive mode where players compete to reach the finish line first!'
    : 'Battle is a competitive mode where players try to eliminate each other!';
  description.style.marginBottom = '20px';

  const joinBtn = document.createElement('button');
  joinBtn.textContent = 'Join Game';
  joinBtn.onclick = () => {
    initializeGame(gameType);
  };

  const backBtn = document.createElement('button');
  backBtn.textContent = 'Back';
  backBtn.style.marginLeft = '10px';
  backBtn.onclick = () => container.remove();

  container.appendChild(description);
  container.appendChild(joinBtn);
  container.appendChild(backBtn);
  document.body.appendChild(container);
}

function showWaitingRoom(currentPlayers, requiredPlayers) {
  // Remove existing panel if it exists
  const existingPanel = document.getElementById('gamePanel');
  if (existingPanel) {
    existingPanel.remove();
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  container.style.zIndex = '1000';
  container.id = 'gamePanel';

  const title = document.createElement('h2');
  title.textContent = 'Waiting for Players';
  title.style.marginBottom = '20px';
  title.style.textAlign = 'center';

  const playerCount = document.createElement('p');
  playerCount.textContent = `Players: ${currentPlayers}/${requiredPlayers}`;
  playerCount.style.fontSize = '18px';
  playerCount.style.textAlign = 'center';
  playerCount.style.marginBottom = '20px';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => {
    socket.disconnect();
    container.remove();
    showGameSelectionUI();
  };

  container.appendChild(title);
  container.appendChild(playerCount);
  container.appendChild(cancelBtn);
  document.body.appendChild(container);
}

async function initializeGame(gameType) {
  try {
    // Connect to the socket
    await socket.connect();
    gameState.gameType = gameType;

    console.log(socket.id);

    // Create a promise that resolves when the socket connects
    gameState.localPlayer = socket.id;
    console.log('Connected with ID:', gameState.localPlayer);

    // Now that we're connected, emit the join event
    console.log('Emitting join event for game type:', gameType);
    socket.emit(`player:join:${gameType}`);

    // Set up socket event handlers
    socket.on('waitingRoom', (state) => {
      gameState.waitingRoom = state;
      gameState.isGameStarted = false;
      showWaitingRoom(state.currentPlayers, state.requiredPlayers);
    });

    socket.on('gameSetup', (setup) => {
      console.log('Received game setup:', setup);
      gameState.players = setup.players;
      gameState.isGameStarted = true;
      hideReconnectingOverlay(); // Hide overlay when game setup is received
      // Remove waiting room panel
      const panel = document.getElementById('gamePanel');
      if (panel) {
        panel.remove();
      }
      document.getElementById('ui-id')?.remove();

      // Initialize local player controller if it doesn't exist
      if (!localPlayerController && p5Instance) {
        const localPlayer = Object.values(setup.players).find(p => p.playerId === gameState.playerId);
        if (localPlayer) {
          console.log('Initializing local player controller for:', localPlayer);
          // Make sure we have valid x and y coordinates
          const x = localPlayer.x || 400; // Default to center if undefined
          const y = localPlayer.y || 300; // Default to center if undefined
          localPlayerController = new PlayerController(p5Instance, x, y, gameState.playerId);
          localPlayerController.initSprite(penguinImages);
        } else {
          console.error('Could not find local player in game setup:', gameState.playerId);
        }
      }
    });

    socket.on('gameState', (state) => {
      console.log("Receiving game state.", state);
      if (gameState.isGameStarted) {
        gameState.players = state.players;
      }
    });

    socket.on('playerId', (id) => {
      console.log('Received player ID:', id);
      gameState.playerId = id;
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      gameState.isGameStarted = false;
      localPlayerController = null;
      attemptReconnect();
    });

    socket.on('reconnect:success', (data) => {
      console.log('Reconnection successful:', data);
      gameState.gameType = data.gameType;
      gameState.playerId = data.playerId;
      gameState.isGameStarted = true;
    });

    return true;
  } catch (error) {
    console.error('Failed to connect to socket:', error);
    return false;
  }
}

async function reinitializeGame() {
  try {
    // Connect to the socket
    await socket.connect();

    // Create a promise that resolves when the socket connects
    gameState.localPlayer = socket.id;

    socket.on('gameSetup', (setup) => {
      console.log('Received game setup:', setup);
      gameState.players = setup.players;
      gameState.isGameStarted = true;
      // Remove waiting room panel
      const panel = document.getElementById('gamePanel');
      if (panel) {
        panel.remove();
      }
      document.getElementById('ui-id').remove();

      // Initialize local player controller if it doesn't exist
      if (!localPlayerController && p5Instance) {
        const localPlayer = Object.values(setup.players).find(p => p.playerId === gameState.playerId);
        if (localPlayer) {
          console.log('Initializing local player controller for:', localPlayer);
          // Make sure we have valid x and y coordinates
          const x = localPlayer.x || 400; // Default to center if undefined
          const y = localPlayer.y || 300; // Default to center if undefined
          localPlayerController = new PlayerController(p5Instance, x, y, gameState.playerId);
          localPlayerController.initSprite(penguinImages);
        } else {
          console.error('Could not find local player in game setup:', gameState.playerId);
        }
      }
    });

    socket.on('gameState', (state) => {
      console.log("Receiving game state.", state);
      if (gameState.isGameStarted) {
        gameState.players = state.players;
      }
    });

    socket.on('playerId', (id) => {
      console.log('Received player ID:', id);
      gameState.playerId = id;
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      gameState.isGameStarted = false;
      localPlayerController = null;
      attemptReconnect();
    });

    socket.on('reconnect:success', (data) => {
      console.log('Reconnection successful:', data);
      gameState.gameType = data.gameType;
      gameState.playerId = data.playerId;
      gameState.isGameStarted = true;
    });

    return true;
  } catch (error) {
    console.error('Failed to connect to socket:', error);
    return false;
  }
}

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

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('Max reconnect attempts reached, returning to menu');
    socket.disconnect();
    hideReconnectingOverlay();
    showGameSelectionUI();
    return;
  }

  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  showReconnectingOverlay();

  setTimeout(async () => {
    if (!socket.connected) {
      await socket.connect();

      if (gameState.playerId) {
        console.log('Socket connected, attempting to reconnect to game with playerId:', gameState.playerId);
        // Reinitialize the game with the same game type
        await initializeGame(gameState.gameType);
        // After initialization, send the reconnect request
        socket.emit('player:reconnect', gameState.playerId);
      }
    }
  }, RECONNECT_INTERVAL);
}

// Create a new sketch
const sketch = (p) => {
  let socketInitialized = false;
  p5Instance = p;

  p.setup = async () => {
    p.createCanvas(800, 600);
    p.background(51);

    // Load penguin walking animation frames
    penguinImages = [
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk01.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk02.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk03.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk04.png')
    ];

    // Register arrow keys
    keyManager.register('up', 'ArrowUp');
    keyManager.register('down', 'ArrowDown');
    keyManager.register('left', 'ArrowLeft');
    keyManager.register('right', 'ArrowRight');

    // Set up key event handlers
    p.keyPressed = (event) => {
      console.log(event, event.key);
      keyManager.keyPressed(event.key);
    };

    p.keyReleased = (event) => {
      keyManager.keyReleased(event.key);
    };

    // Show game selection UI
    showGameSelectionUI();
  };

  p.draw = () => {
    p.background(51);

    if (!gameState.isGameStarted) {
      return;
    }

    // Update local player controller if it exists
    if (localPlayerController) {
      localPlayerController.updateInputs();
      localPlayerController.smoothPhysics();
    }

    // Draw all players
    Object.values(gameState.players).forEach(player => {
      // Check if this is the local player by comparing playerId
      if (player.playerId === gameState.playerId) {
        // Update position
        localPlayerController.x = player.x;
        localPlayerController.y = player.y;

        // Display the player
        localPlayerController.display();
      } else {
        // Draw opponent with blinking effect if disconnected
        if (player.disconnected) {
          p.fill(255, 0, 0, p.sin(p.frameCount * 0.1) * 127 + 128);
        } else {
          p.fill(255);
        }
        p.ellipse(player.x, player.y, 30, 30);
      }
    });

    // Draw disconnect button
    p.fill(255);
    p.rect(10, 10, 100, 30);
    p.fill(0);
    p.text('Disconnect', 20, 30);
  };

  p.mousePressed = () => {
    // Check if disconnect button was clicked
    if (p.mouseX >= 10 && p.mouseX <= 110 && p.mouseY >= 10 && p.mouseY <= 40) {
      socket.disconnect();
      showGameSelectionUI();
    }
  };
};

// Helper function to load images asynchronously
function loadImageAsync(p, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const p5Image = p.createImage(img.width, img.height);
      p5Image.drawingContext.drawImage(img, 0, 0);
      resolve(p5Image);
    };
    img.src = src;
  });
}

// Create new p5 instance with our sketch
new p5(sketch);