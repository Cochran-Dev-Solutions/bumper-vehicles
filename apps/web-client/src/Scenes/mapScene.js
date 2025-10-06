import {
  Button,
  mouse,
  keyManager,
  sceneManager,
  socket,
  GameRenderer,
  Island,
  MapCharacter,
  Camera,
  gameInfo,
  updateGameInfo,
  globalGameRenderer,
} from "client-logic";
import { p5Images, skyBackground } from "../render-tools/images.js";

///////////////////////////////////////////////////
// Create Buttons
///////////////////////////////////////////////////
const buttons = {
  back: new Button({
    width: 50,
    height: 50,
    display: function () {
      const p = this.p;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;

      // Check if mouse is hovering
      const isHovering = this.isInside(mouse, this);

      if (isHovering) {
        mouse.setCursor("pointer");
        // Hover effect: slightly larger and brighter
        p.fill(0, 180, 0, 220); // Brighter green with more opacity
        p.ellipse(centerX, centerY, this.width + 4, this.height + 4);
      }

      // Main button background
      p.fill(0, 150, 0, 200); // Green color
      p.noStroke();
      p.ellipse(centerX, centerY, this.width, this.height);

      // Draw left-pointing arrow
      p.fill(255); // White arrow
      p.noStroke();

      // Arrow head (triangle pointing left)
      const arrowSize = 20;
      const arrowX = centerX + 2; // Slightly offset to the right
      const arrowY = centerY;

      p.triangle(
        arrowX,
        arrowY - arrowSize / 2, // Top point
        arrowX - arrowSize / 1.2,
        arrowY, // Left point (tip)
        arrowX,
        arrowY + arrowSize / 2 // Bottom point
      );

      // Arrow shaft
      p.rect(centerX, centerY - arrowSize / 4, arrowSize / 1.5, arrowSize / 2);
    },
    onClick: function () {
      // Call the scene's exitIslandPanel method
      if (
        sceneManager.currentScene &&
        sceneManager.currentScene.exitIslandPanel
      ) {
        sceneManager.currentScene.exitIslandPanel();
      }
    },
  }),
  // New buttons for island panels
  joinRace: new Button({
    width: 120,
    height: 40,
    display: function () {
      const p = this.p;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(0, 150, 0, 200); // Green color for join
      }
      p.rect(this.x, this.y, this.width, this.height, 5);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Join Race", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: async function () {
      hasJoined = true;
      const gameType = "race";
      const gameRenderer = new GameRenderer({ p: sceneManager.p });
      // expose for game scene
      globalThis.globalGameRenderer = gameRenderer;

      // ensure socket connected
      if (!socket.connected) {
        await socket.connect();
      }

      // waiting room updates
      socket.off("waitingRoom");
      socket.on("waitingRoom", data => {
        window.dispatchEvent(
          new CustomEvent("waitingRoomUpdate", { detail: data })
        );
      });

      // receive player id (one-time)
      const onPlayerId = playerId => {
        updateGameInfo({ player_id: playerId, socket_id: socket.id, game_type: gameType });
        socket.off("player-id", onPlayerId);
      };
      socket.on("player-id", onPlayerId);

      // initial setup from server (one-time)
      const onGameSetup = async initialState => {
        updateGameInfo({ initial_game_state: initialState });
        await gameRenderer.setup(sceneManager.p, gameInfo);
        sceneManager.createTransition("game");
        socket.off("gameSetup", onGameSetup);
      };
      socket.on("gameSetup", onGameSetup);

      // send join event
      socket.emit("player:join:event", { gameType, userData: sceneManager.user });
    },
  }),
  leaveRace: new Button({
    width: 120,
    height: 40,
    display: function () {
      const p = this.p;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(150, 0, 0, 200); // Red color for leave
      }
      p.rect(this.x, this.y, this.width, this.height, 5);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Leave", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (socket.connected && gameInfo.player_id) {
        hasJoined = false;
        socket.emit("player:delete", gameInfo.player_id);
      } else {
        alert("Error. Try Again.");
      }
    },
  }),
  joinBattle: new Button({
    width: 120,
    height: 40,
    display: function () {
      const p = this.p;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(0, 150, 0, 200); // Green color for join
      }
      p.rect(this.x, this.y, this.width, this.height, 5);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Join Battle", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: async function () {
      hasJoined = true;
      const gameType = "battle";
      const gameRenderer = new GameRenderer({ p: sceneManager.p });
      // expose for game scene
      globalThis.globalGameRenderer = gameRenderer;

      // ensure socket connected
      if (!socket.connected) {
        await socket.connect();
      }

      // waiting room updates
      socket.off("waitingRoom");
      socket.on("waitingRoom", data => {
        window.dispatchEvent(
          new CustomEvent("waitingRoomUpdate", { detail: data })
        );
      });

      // receive player id (one-time)
      const onPlayerId = playerId => {
        updateGameInfo({ player_id: playerId, socket_id: socket.id, game_type: gameType });
        socket.off("player-id", onPlayerId);
      };
      socket.on("player-id", onPlayerId);

      // initial setup from server (one-time)
      const onGameSetup = async initialState => {
        updateGameInfo({ initial_game_state: initialState });
        await gameRenderer.setup(sceneManager.p, gameInfo);
        sceneManager.createTransition("game");
        socket.off("gameSetup", onGameSetup);
      };
      socket.on("gameSetup", onGameSetup);

      // send join event
      socket.emit("player:join:event", { gameType, userData: sceneManager.user });
    },
  }),
  leaveBattle: new Button({
    width: 120,
    height: 40,
    display: function () {
      const p = this.p;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(150, 0, 0, 200); // Red color for leave
      }
      p.rect(this.x, this.y, this.width, this.height, 5);
      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Leave", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (socket.connected && gameInfo.player_id) {
        hasJoined = false;
        socket.emit("player:delete", gameInfo.player_id);
      } else {
        alert("Error. Try Again.");
      }
    },
  }),
};

///////////////////////////////////////////////////
// Panel Methods for Islands
///////////////////////////////////////////////////
function racePanelMethod(p, panelX, panelY, panelWidth, panelHeight) {
  // Draw additional race-specific content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    "• Compete against other players in a race to the finish",
    panelX + 20,
    panelY + 140
  );
  p.text(
    "• First player to complete the course wins",
    panelX + 20,
    panelY + 170
  );
  p.text("• Requires 2-4 players to start", panelX + 20, panelY + 200);

  if (hasJoined) {
    p.text(
      `Players: ${waitingRoom.currentPlayers}/${waitingRoom.requiredPlayers}`,
      panelX + 20,
      panelY + 240
    );
  }

  // Position and activate appropriate button
  if (hasJoined) {
    buttons.leaveRace.update(panelX + 20, panelY + panelHeight - 60);
  } else {
    buttons.joinRace.update(panelX + 20, panelY + panelHeight - 60);
  }
}

function battlePanelMethod(p, panelX, panelY, panelWidth, panelHeight) {
  // Draw additional battle-specific content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    "• Battle against other players in an arena",
    panelX + 20,
    panelY + 140
  );
  p.text("• Last player standing wins", panelX + 20, panelY + 170);
  p.text("• Requires 2-4 players to start", panelX + 20, panelY + 200);

  if (hasJoined) {
    p.text(
      `Players: ${waitingRoom.currentPlayers}/${waitingRoom.requiredPlayers}`,
      panelX + 20,
      panelY + 240
    );
  }

  // Position and activate appropriate button
  if (hasJoined) {
    buttons.leaveBattle.update(panelX + 20, panelY + panelHeight - 60);
  } else {
    buttons.joinBattle.update(panelX + 20, panelY + panelHeight - 60);
  }
}

function garagePanelMethod(p, panelX, panelY, panelWidth, panelHeight) {
  // Draw garage-specific content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.LEFT, p.TOP);
  p.text("• Customize your vehicle", panelX + 20, panelY + 140);
  p.text("• Upgrade performance and appearance", panelX + 20, panelY + 170);
  p.text("• Coming soon!", panelX + 20, panelY + 200);
}

function hallOfFamePanelMethod(p, panelX, panelY, panelWidth, panelHeight) {
  // Draw hall of fame specific content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.LEFT, p.TOP);
  p.text("• View top players and achievements", panelX + 20, panelY + 140);
  p.text("• Check your own stats and rankings", panelX + 20, panelY + 170);
  p.text("• Coming soon!", panelX + 20, panelY + 200);
}

function soloChallengePanelMethod(p, panelX, panelY, panelWidth, panelHeight) {
  // Draw solo challenge specific content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.LEFT, p.TOP);
  p.text("• Practice alone on various tracks", panelX + 20, panelY + 140);
  p.text("• Complete challenges and earn rewards", panelX + 20, panelY + 170);
  p.text("• Coming soon!", panelX + 20, panelY + 200);
}

///////////////////////////////////////////////////
// Method for generating islands
///////////////////////////////////////////////////
function generateIslands(p) {
  // Island positions (two rows)
  const w = 120,
    h = 80,
    padX = p.width / 2 / 3,
    padY = 30,
    offSetY = -60;

  const positions = [
    { x: p.width / 2 - w - padX, y: p.height / 2 - h - padY + offSetY },
    { x: p.width / 2, y: p.height / 2 - h - padY + offSetY },
    { x: p.width / 2 + w + padX, y: p.height / 2 - h - padY + offSetY },
    {
      x: p.width / 2 - w / 2 - padX / 2,
      y: p.height / 2 + h + padY + offSetY / 2,
    },
    {
      x: p.width / 2 + w / 2 + padX / 2,
      y: p.height / 2 + h + padY + offSetY / 2,
    },
  ];

  const titles = ["Garage", "Hall of Fame", "Race", "Battle", "Solo Challenge"];
  const slugs = ["garage", "hall_of_fame", "race", "battle", "solo_challenge"];
  const descriptions = [
    "Customize and upgrade your vehicle with various parts and cosmetics.",
    "View leaderboards, achievements, and player statistics.",
    "Compete in fast-paced races against other players across challenging tracks.",
    "Engage in intense arena battles where only the strongest survive.",
    "Practice your skills in solo challenges and time trials.",
  ];
  const panelMethods = [
    garagePanelMethod,
    hallOfFamePanelMethod,
    racePanelMethod,
    battlePanelMethod,
    soloChallengePanelMethod,
  ];

  // Example offsets (customize as needed)
  const titleOffset = { x: 0, y: -110 };
  const stopOffset = { x: 0, y: 150 };

  return positions.map(
    (pos, i) =>
      new Island({
        x: pos.x,
        y: pos.y,
        title: titles[i],
        titleOffset,
        stopOffset,
        image: p5Images["island"],
        panel_method: panelMethods[i],
        slug: slugs[i],
        description: descriptions[i],
      })
  );
}

///////////////////////////////////////////////////
// Method for setting up island movement graph
///////////////////////////////////////////////////
function setupIslandMovementGraph(islands) {
  // Move middle-top island up slightly
  islands[1].y -= 30;

  // Top-Left Island (index 0)
  islands[0].movement_actions = {
    right: islands[1], // Middle-top
    down: islands[3], // Bottom-left
  };

  // Middle-top Island (index 1)
  islands[1].movement_actions = {
    left: islands[0], // Top-left
    right: islands[2], // Top-right
  };

  // Top-right Island (index 2)
  islands[2].movement_actions = {
    left: islands[1], // Middle-top
    down: islands[4], // Bottom-right
  };

  // Bottom-left Island (index 3)
  islands[3].movement_actions = {
    up: islands[0], // Top-left
    right: islands[4], // Bottom-right
  };

  // Bottom-right Island (index 4)
  islands[4].movement_actions = {
    up: islands[2], // Top-right
    left: islands[3], // Bottom-left
  };
}

///////////////////////////////////////////////////
// Sky System
///////////////////////////////////////////////////
let clouds = [];

// Initialize clouds
function initializeClouds(p) {
  clouds = [];
  const numClouds = p.width / 50;

  for (let i = 0; i < numClouds; i++) {
    clouds.push({
      x: p.random(-200, p.width + 200),
      y: p.random(p.height * 0.1, p.height),
      speed: p.random(0.1, 0.3), // Very slow movement
      scale: p.random(0.1, 0.5),
      opacity: p.random(150, 200),
      direction: p.random() > 0.5 ? 1 : -1, // Random direction
      offset: p.random(p.TWO_PI), // Random starting position
    });
  }
}

// Update cloud positions
function updateClouds(p) {
  clouds.forEach(cloud => {
    // Move clouds very slowly
    cloud.x += cloud.speed * cloud.direction;

    // Get cloud width based on scale and image size
    const cloudWidth = p5Images["cloud"]
      ? p5Images["cloud"].width * cloud.scale
      : 100;
    const cloudHeight = p5Images["cloud"]
      ? p5Images["cloud"].height * cloud.scale
      : 50;

    // Loop clouds when they go completely off screen
    if (cloud.direction > 0 && cloud.x > p.width + cloudWidth / 2) {
      // Cloud moving right - reset to left side when completely off screen
      cloud.x = -cloudWidth / 2;
    } else if (cloud.direction < 0 && cloud.x < -cloudWidth / 2) {
      // Cloud moving left - reset to right side when completely off screen
      cloud.x = p.width + cloudWidth / 2;
    }
  });
}

// Draw all clouds
function drawClouds(p) {
  clouds.forEach(cloud => {
    if (p5Images["cloud"]) {
      p.push();
      p.translate(cloud.x, cloud.y);
      p.scale(cloud.scale);
      p.image(
        p5Images["cloud"],
        -p5Images["cloud"].width / 2,
        -p5Images["cloud"].height / 2
      );
      p.pop();
    }
  });
}

///////////////////////////////////////////////////
// Waiting Room Data
///////////////////////////////////////////////////
let waitingRoom = {
  currentPlayers: 0,
  requiredPlayers: 0,
};

///////////////////////////////////////////////////
// Panel Management
///////////////////////////////////////////////////
// Scene state
let activePanel = null;
let hasJoined = false;
let justZoomedIn = false; // Add this flag
let justActivatedButton = false; // Add debounce for join/leave

// Listen for waiting room updates from GameRenderer
window.addEventListener('waitingRoomUpdate', (event) => {
  waitingRoom = event.detail;
});

const mapScene = {
  name: "Map Scene",
  selectedIsland: null,
  isZoomedIn: false,
  init: async function () {
    // reinitalize game info to store null values
    updateGameInfo({
      initial_game_state: null,
      game_type: null,
      player_id: null,
      socket_id: null,
    });

    // initialize clouds
    initializeClouds(this.p);

    // generate islands
    this.islands = generateIslands(this.p);

    // setup island movement graph
    setupIslandMovementGraph(this.islands);

    // create camera
    this.camera = Camera.createForMapScene(this.p);

    // create map character
    this.mapCharacter = new MapCharacter(this.p, this.islands, this);
    await this.mapCharacter.load(p5Images["ari_alligator_frames"]);

    // initialize panels
    activePanel = null;
    hasJoined = false;

    // initialize selection state
    this.selectedIsland = null;
    this.isZoomedIn = false;
  },
  display: function () {
    if (!this.camera) return;

    // Handle keyboard input for back button
    if (keyManager.pressed("left") && this.isZoomedIn) {
      // Trigger back button click
      if (buttons["back"].onClick) {
        buttons["back"].onClick();
      }
      // Clear the left arrow key so it is not processed again
      keyManager.keyReleased("ArrowLeft");
    } else if (this.isZoomedIn) {
      // Debounce enter after zooming in or after join/leave
      if (justZoomedIn) {
        if (!keyManager.pressed("enter")) {
          justZoomedIn = false;
        }
      } else if (justActivatedButton) {
        if (!keyManager.pressed("enter")) {
          justActivatedButton = false;
        }
      } else if (keyManager.pressed("enter")) {
        switch (this.selectedIsland.slug) {
          case "race":
            if (hasJoined) {
              buttons["leaveRace"].onClick();
            } else {
              buttons["joinRace"].onClick();
            }
            break;
          case "battle":
            if (hasJoined) {
              buttons["leaveBattle"].onClick();
            } else {
              buttons["joinBattle"].onClick();
            }
            break;
        }
        keyManager.keyReleased("enter");
        justActivatedButton = true; // Debounce after join/leave
      }
    }

    // Update camera
    this.camera.update();

    // Deactivate all buttons at the start of the frame
    Object.values(buttons).forEach(btn => (btn.active = false));

    // Layer 1: Sky Background (Perlin noise) - NO CAMERA TRANSFORM
    if (skyBackground) {
      // Apply blur effect when drawing
      this.p.push();
      this.p.drawingContext.filter = "blur(5px)";
      this.p.image(skyBackground, 0, 0);
      this.p.pop();
    }

    // Layer 2: Moving Clouds - NO CAMERA TRANSFORM
    updateClouds(this.p);
    drawClouds(this.p);

    // Apply camera transformation for game elements
    this.camera.apply();

    // Layer 3: Islands (with camera transform)
    if (this.islands) {
      for (const island of this.islands) {
        island.image = p5Images["island"]; // Ensure image is set after async load
        // Check if player is at this island
        const isPlayerAtIsland =
          this.mapCharacter && this.mapCharacter.island === island;
        island.draw(this.p, isPlayerAtIsland);
      }
    }

    // Layer 4: Map Character (with camera transform)
    if (this.mapCharacter) {
      this.mapCharacter.update();
      this.mapCharacter.draw();
    }

    // Restore camera transformation for UI elements
    this.camera.restore();

    // Layer 6: Island Panel (when zoomed in)
    if (this.isZoomedIn && this.selectedIsland) {
      this.selectedIsland.displayPanel(this.p, this.camera);
      // Update back button position and make it active
      buttons["back"].update(50, 50);
    }
  },

  // Handle island selection
  selectIsland: function (island) {
    this.selectedIsland = island;
    this.isZoomedIn = true;
    justZoomedIn = true; // Set debounce flag

    // Disable character movement
    if (this.mapCharacter) {
      this.mapCharacter.inputEnabled = false;
    }

    // Zoom camera to island
    const stopPos = island.getStopPosition();
    const scale = 4;
    this.camera.zoomTo(
      stopPos.x + island.width / 2,
      stopPos.y - island.height / 2 - 25,
      scale
    );

    island.select();
  },

  // Exit island panel
  exitIslandPanel: function () {
    this.selectedIsland.deselect();

    this.isZoomedIn = false;
    this.selectedIsland = null;

    // Reset join state
    hasJoined = false;

    // Re-enable character movement
    if (this.mapCharacter) {
      this.mapCharacter.inputEnabled = true;
    }

    // leave waiting room if you had joind
    if (socket.connected && gameInfo.player_id) {
      hasJoined = false;
      socket.emit("player:delete", gameInfo.player_id);
    }

    // Reset camera
    this.camera.reset();
  },

  buttons: Object.values(buttons),
};

export default mapScene;
