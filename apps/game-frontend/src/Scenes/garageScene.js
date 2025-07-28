import { Button, mouse, keyManager, sceneManager, GarageCharacter } from "@bv-frontend-logic";
import { p5Images, skyBackground } from "../render-tools/images.js";


// garage dimensions
let garage_floor_width,
    garage_floor_height = 150;

let vertical_wall_height,
    vertical_wall_width = 100;

let garage_ceiling_height = 100,
    garage_ceiling_width;

let landing_bay_height;

// color palette
let colors;

// Test player data
const testPlayerData = {
  displayName: "BumperMaster",
  username: "bumper_vehicles_fan",
  bio: "Professional bumper vehicle enthusiast. Love collecting rare vehicles and competing in tournaments. Always looking for new challenges!",
  teamAcronym: "BVC",
  isFriend: false
};

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
      sceneManager.createTransition('map');
    },
  }),
  
  // New icon buttons
  characters: new Button({
    width: 50,
    height: 50,
    display: function () {
      const p = this.p;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const isHovering = this.isInside(mouse, this);

      if (isHovering) {
        mouse.setCursor("pointer");
      }

      // Scale effect on hover
      const scale = isHovering ? 1.2 : 1.0;
      
      p.push();
      p.translate(centerX, centerY);
      p.scale(scale);
      p.imageMode(p.CENTER);
      p.image(p5Images["characters_button"], 0, 0, this.width, this.height);
      p.pop();
    },
    onClick: function () {
      // TODO: Add characters functionality
      console.log("Characters button clicked");
    },
  }),

  achievements: new Button({
    width: 50,
    height: 50,
    display: function () {
      const p = this.p;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const isHovering = this.isInside(mouse, this);

      if (isHovering) {
        mouse.setCursor("pointer");
      }

      // Scale effect on hover
      const scale = isHovering ? 1.2 : 1.0;
      
      p.push();
      p.translate(centerX, centerY);
      p.scale(scale);
      p.imageMode(p.CENTER);
      p.image(p5Images["achievements_button"], 0, 0, this.width, this.height);
      p.pop();
    },
    onClick: function () {
      // TODO: Add achievements functionality
      console.log("Achievements button clicked");
    },
  }),

  powerups: new Button({
    width: 50,
    height: 50,
    display: function () {
      const p = this.p;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const isHovering = this.isInside(mouse, this);

      if (isHovering) {
        mouse.setCursor("pointer");
      }

      // Scale effect on hover
      const scale = isHovering ? 1.2 : 1.0;
      
      p.push();
      p.translate(centerX, centerY);
      p.scale(scale);
      p.imageMode(p.CENTER);
      p.image(p5Images["powerups_button"], 0, 0, this.width, this.height);
      p.pop();
    },
    onClick: function () {
      // TODO: Add powerups functionality
      console.log("Powerups button clicked");
    },
  }),

  upgrades: new Button({
    width: 50,
    height: 50,
    display: function () {
      const p = this.p;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const isHovering = this.isInside(mouse, this);

      if (isHovering) {
        mouse.setCursor("pointer");
      }

      // Scale effect on hover
      const scale = isHovering ? 1.2 : 1.0;
      
      p.push();
      p.translate(centerX, centerY);
      p.scale(scale);
      p.imageMode(p.CENTER);
      p.image(p5Images["upgrades_button"], 0, 0, this.width, this.height);
      p.pop();
    },
    onClick: function () {
      // TODO: Add upgrades functionality
      console.log("Upgrades button clicked");
    },
  })
};

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
  clouds.forEach((cloud) => {
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
  clouds.forEach((cloud) => {
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



// method to build garage using basic p5.js shapes
const display_garage = function() {
  const p = sceneManager.getCanvas();
  
  p.noStroke();

  // landing bay area
  // p.fill(colors["grey-2"]);
  // p.arc(p.width/2, p.height - garage_floor_height, garage_floor_width - vertical_wall_width * 8, landing_bay_height * 2, p.PI, p.PI * 2);
  p.push();
  p.translate(p.width/2, p.height - 400);
  p.scale(1);
  p.image(
    p5Images["landing_bay"],
    -p5Images["landing_bay"].width / 2,
    -p5Images["landing_bay"].height / 2
  );
  p.pop();

  p.fill(colors["blue-grey-1"]);

  // base of garage
  p.rect(0, p.height - garage_floor_height, garage_floor_width, garage_floor_height);
  p.arc(p.width/2, p.height - garage_floor_height, garage_floor_width, 100, p.PI, p.PI * 2);

  p.fill(colors["grey-1"]);

  // ceiling overhang
  p.rect(vertical_wall_width, 0, garage_ceiling_width, garage_ceiling_height);

  p.stroke(0, 0, 0);
  p.fill(colors["grey-3"]);
  p.rect(vertical_wall_width, garage_ceiling_height - 4, garage_ceiling_width, 8);
  p.noStroke();
  p.fill(colors["grey-1"]);

  // left/right vertical walls
  p.rect(0, 0, vertical_wall_width, vertical_wall_height);
  p.triangle(
    0, vertical_wall_height,
    vertical_wall_width, vertical_wall_height,
    0, vertical_wall_height + 75
  );
  p.stroke(0, 0, 0);
  p.fill(colors["grey-3"]);
  p.rect(vertical_wall_width - 4, 0, 8, vertical_wall_height + 5);
  p.noStroke();
  p.fill(colors["grey-1"]);
  p.rect(p.width - vertical_wall_width, 0, vertical_wall_width, vertical_wall_height);
  p.triangle(
    p.width, vertical_wall_height,
    p.width - vertical_wall_width, vertical_wall_height,
    p.width, vertical_wall_height + 75
  );
  p.stroke(0, 0, 0);
  p.fill(colors["grey-3"]);
  p.rect(p.width - vertical_wall_width - 4, 0, 8, vertical_wall_height + 5);
  p.noStroke();
  p.fill(colors["grey-1"]);
};

// Function to draw player info panel
function drawPlayerInfoPanel(p) {
  const panelHeight = 175;
  const panelY = p.height - panelHeight;
  const panelWidth = p.width - vertical_wall_width * 2 - 450;
  const panelX = (p.width - panelWidth) / 2;
  const cornerRadius = 15;
  
  // Panel background with rounded corners
  p.fill(colors["grey-1"]);
  p.stroke(colors["grey-3"]);
  p.strokeWeight(2);
  p.rect(panelX, panelY, panelWidth, panelHeight, cornerRadius);
  p.noStroke();
  
  // Team acronym badge (top right of panel)
  const badgeSize = 40;
  const badgeX = panelX + panelWidth - badgeSize - 20;
  const badgeY = panelY + 20;
  
  p.fill(colors["blue-grey-1"]);
  p.ellipse(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize, badgeSize);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.text(testPlayerData.teamAcronym, badgeX + badgeSize/2, badgeY + badgeSize/2);
  
  // Player display name
  p.fill(255);
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(24);
  p.textStyle(p.BOLD);
  p.text(testPlayerData.displayName, panelX + 20, panelY + 15);
  
  // Username subtitle
  p.fill(200);
  p.textSize(14);
  p.textStyle(p.NORMAL);
  p.text(`@${testPlayerData.username}`, panelX + 20, panelY + 45);
  
  // Bio text
  p.fill(220);
  p.textSize(12);
  p.textStyle(p.NORMAL);
  
  // Wrap bio text to fit panel width
  const maxBioWidth = panelWidth - 40 - badgeSize - 20; // Account for badge
  const words = testPlayerData.bio.split(' ');
  let currentLine = '';
  let lineY = panelY + 70;
  const lineHeight = 16;
  
  for (let word of words) {
    const testLine = currentLine + word + ' ';
    const testWidth = p.textWidth(testLine);
    
    if (testWidth > maxBioWidth && currentLine !== '') {
      p.text(currentLine, panelX + 20, lineY);
      currentLine = word + ' ';
      lineY += lineHeight;
    } else {
      currentLine = testLine;
    }
  }
  
  // Draw the last line
  if (currentLine !== '') {
    p.text(currentLine, panelX + 20, lineY);
  }
  
  // Friend button/status
  const friendButtonX = panelX + 20;
  const friendButtonY = panelY + panelHeight - 35;
  const friendButtonWidth = 100;
  const friendButtonHeight = 25;
  
  if (testPlayerData.isFriend) {
    // Show friend status
    p.fill(0, 150, 0);
    p.rect(friendButtonX, friendButtonY, friendButtonWidth, friendButtonHeight, 5);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text("✓ Friends", friendButtonX + friendButtonWidth/2, friendButtonY + friendButtonHeight/2);
  } else {
    // Show add friend button
    p.fill(colors["blue-grey-1"]);
    p.rect(friendButtonX, friendButtonY, friendButtonWidth, friendButtonHeight, 5);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text("+ Add Friend", friendButtonX + friendButtonWidth/2, friendButtonY + friendButtonHeight/2);
  }
}

const garageScene = {
  name: "Garage Scene",
  selectedIsland: null,
  isZoomedIn: false,
  init: async function () {
    const p = this.p;
    
    // define color palette
    colors = {
      "grey-1" : p.color(70, 90, 110),
      "grey-2" : p.color(125, 125, 125),
      "grey-3" : p.color(75, 75, 75),
      "blue-grey-1" : p.color(89, 106, 134)
    };

    // Set garage dimensions dynamically
    garage_floor_width = this.p.width;
    vertical_wall_height = this.p.height - garage_floor_height;
    garage_ceiling_width = this.p.width - 2 * vertical_wall_width;
    landing_bay_height = (this.p.height - garage_ceiling_height - garage_floor_height) / 2;

    // create map character
    this.garageCharacter = new GarageCharacter(this.p, this.p.width/2, this.p.height/2 - 45);
    await this.garageCharacter.load(p5Images["ari_alligator_frames"]);

    // initialize clouds
    initializeClouds(this.p);
  },
  display: function () {
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

    // Layer 3: Display Garage Outline
    display_garage();

    // Layer 4: Display Character + Player Info
    if (this.garageCharacter) {
      this.garageCharacter.draw();
    }

    // Layer 5: display garage amenities & items
    p5Images["mystery_box"].resize(350, 350);
    this.p.push();
    this.p.translate(this.p.width - p5Images["mystery_box"].width/3, this.p.height - p5Images["mystery_box"].height/3)
    this.p.scale(2/3);
    this.p.image(
      p5Images["mystery_box"],
      -p5Images["mystery_box"].width / 2,
      -p5Images["mystery_box"].height / 2
    );
    this.p.pop();

    this.p.push();
    this.p.translate(180, this.p.height - 100);
    this.p.scale(0.5);
    this.p.image(
      p5Images["desk"],
      -p5Images["desk"].width / 2,
      -p5Images["desk"].height / 2
    );
    this.p.pop();

    this.p.push();
    this.p.translate(125, this.p.height - 207);
    this.p.scale(1/6);
    this.p.image(
      p5Images["coins"],
      -p5Images["coins"].width / 2,
      -p5Images["coins"].height / 2
    );
    this.p.pop();

    this.p.push();
    this.p.translate(225, this.p.height - 207);
    this.p.scale(1/6);
    this.p.image(
      p5Images["xp_capsule"],
      -p5Images["xp_capsule"].width / 2,
      -p5Images["xp_capsule"].height / 2
    );
    this.p.pop();

    // Layer 6: display button UI
    buttons['back'].update(25, 25);
    
    // Position icon buttons along the top of the screen (garage ceiling area)
    const buttonSpacing = 80; // Space between buttons
    const topMargin = 25; // Distance from top of screen
    const startX = this.p.width - buttonSpacing * 4 - vertical_wall_width; // Starting X position
    
    buttons['characters'].update(startX, topMargin);
    buttons['achievements'].update(startX + buttonSpacing, topMargin);
    buttons['powerups'].update(startX + buttonSpacing * 2, topMargin);
    buttons['upgrades'].update(startX + buttonSpacing * 3, topMargin);

    // Layer 7: Player info panel
    drawPlayerInfoPanel(this.p);
  },


  buttons: Object.values(buttons),
};

export default garageScene;
