import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import socket from "../networking/socket.js";
import { gameInfo } from "../globals.js";
import gameRenderer from "../GameActors/GameRenderer.js";

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

let loading = false;

// Input update interval (60fps)
const INPUT_UPDATE_INTERVAL = 1000 / 60;
let lastInputUpdate = 0;

// Penguin images
let penguinImages = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 1000; // 1 second

// to implement
// setup socket events
async function reinitializeGame() {
  try {
    // Connect to the socket
    await socket.connect(setupSocketEvents);
    gameState.localPlayer = socket.id;

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
}

const gameScene = {
  name: "Game Scene",
  init: async function () {
    console.log("Testing gameInfo: ", gameInfo);
    gameRenderer.setup(sceneManager.getCanvas(), gameInfo);

    // Load penguin walking animation frames
    penguinImages = [
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk01.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk02.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk03.png'),
      await loadImageAsync(p, 'src/Images/Penguin/penguin_walk04.png')
    ];

    loading = false;
  },

  display: function () {
    const p = sceneManager.getCanvas();

    if (loading) {
      // Clear background
      p.background(51);
      p.fill(255, 0, 0);
      p.text("Loading...", p.width / 2, p.height / 2);
    } else {
      p.background(51);

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
    }
  },

  buttons: [
    // Disconnect button
    new Button({
      x: 10,
      y: 10,
      width: 100,
      height: 30,
      display: function () {
        const p = sceneManager.getCanvas();

        p.fill(255);
        p.stroke(0);
        p.strokeWeight(1);

        if (this.isInside(mouse, this)) {
          p.fill(175);
          mouse.setCursor('pointer');
        }

        p.rect(this.x, this.y, this.width, this.height);

        p.fill(0);
        p.textSize(16);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Disconnect', this.x + this.width / 2, this.y + this.height / 2);
      },
      onClick: function () {
        socket.disconnect();
      }
    })
  ]
};

export default gameScene; 