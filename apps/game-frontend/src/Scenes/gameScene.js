import {
  Button,
  mouse,
  sceneManager,
  socket,
  gameInfo,
  globalGameRenderer,
} from "@bv-frontend-logic";

let loading = true;
let gameFinished = false;
let raceResults = [];
let finishTime = 0; // Track when the player finished
let showResultsDelay = 2000; // 2 seconds delay before showing results

const buttons = {
  disconnect: new Button({
    width: 100,
    height: 30,
    display: function () {
      this.p.fill(255);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      if (this.isInside(mouse, this)) {
        this.p.fill(175);
        mouse.setCursor("pointer");
      }
      this.p.rect(this.x, this.y, this.width, this.height);
      this.p.fill(0);
      this.p.textSize(16);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(
        "Disconnect",
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    },
  }),
  exitToMap: new Button({
    width: 150,
    height: 40,
    display: function () {
      this.p.fill(0, 150, 255);
      this.p.stroke(0);
      this.p.strokeWeight(2);
      if (this.isInside(mouse, this)) {
        this.p.fill(0, 120, 200);
        mouse.setCursor("pointer");
      }
      this.p.rect(this.x, this.y, this.width, this.height, 5);
      this.p.fill(255);
      this.p.textSize(16);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(
        "Exit to Map",
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    },
  }),
};

const gameScene = {
  name: "Game Scene",
  init: async function () {
    // Use the global GameRenderer instance, already initialized
    this.gameRenderer = globalThis.globalGameRenderer;
    loading = false;

    // Update the exit button to have access to gameRenderer
    buttons.exitToMap.onClick = function () {
      this.gameRenderer.exitGame();
      sceneManager.createTransition("map");
    }.bind(this);

    // Update the disconnect button to have access to gameRenderer
    buttons.disconnect.onClick = function () {
      this.gameRenderer.exitGame();
    }.bind(this);
  },
  display: function () {
    if (loading) {
      this.p.background(51);
      this.p.fill(255, 0, 0);
      this.p.text("Loading...", this.p.width / 2, this.p.height / 2);
    } else {
      try {
        // Check if game is finished
        if (
          this.gameRenderer &&
          this.gameRenderer.localPlayer &&
          this.gameRenderer.localPlayer.finished
        ) {
          if (!gameFinished) {
            gameFinished = true;
            finishTime = Date.now();
            console.log("Player finished! Setting gameFinished to true");
          }

          // Collect race results
          raceResults = [];
          this.gameRenderer.actors.forEach(actor => {
            if (actor.type === "player" && actor.finished) {
              console.log(
                "Found finished player:",
                actor.id,
                "placement:",
                actor.placement
              );
              raceResults.push({
                id: actor.id,
                placement: actor.placement,
                isLocal: actor.id === this.gameRenderer.player_id,
              });
            }
          });
          raceResults.sort((a, b) => a.placement - b.placement);
          console.log("Collected race results:", raceResults);
        }

        this.gameRenderer.update();

        // Display end screen if game is finished and enough time has passed
        if (gameFinished && Date.now() - finishTime > showResultsDelay) {
          console.log(
            "About to display end screen. Time since finish:",
            Date.now() - finishTime
          );
          this.displayEndScreen();
        }
      } catch (error) {
        console.error("Error updating game:", error);
        sceneManager.createTransition("map");
      }
    }

    // Update button positions
    buttons["disconnect"].update(10, 10);
  },

  displayEndScreen: function () {
    console.log("Displaying end screen with results:", raceResults);
    console.log("Canvas dimensions:", this.p.width, "x", this.p.height);

    // Semi-transparent overlay
    this.p.fill(0, 0, 0, 150);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Results popup - larger size
    const popupWidth = this.p.width - 400;
    const popupHeight = this.p.height - 200;
    const popupX = (this.p.width - popupWidth) / 2;
    const popupY = (this.p.height - popupHeight) / 2;

    console.log("Popup position:", popupX, popupY);

    // Semi-transparent white background
    this.p.fill(255, 255, 255, 200);
    this.p.stroke(0, 0, 0, 100);
    this.p.strokeWeight(1);
    this.p.rect(popupX, popupY, popupWidth, popupHeight, 15);

    // Position exit button in top-right corner of popup
    buttons.exitToMap.update(popupX + popupWidth - 170, popupY + 15);

    // Title
    this.p.fill(0);
    this.p.textSize(28);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.noStroke(); // Remove stroke from text
    this.p.text("Race Results", this.p.width / 2, popupY + 60);

    // Results
    this.p.textSize(18);
    raceResults.forEach((result, index) => {
      const y = popupY + 120 + index * 35;
      const placementText = `${result.placement}${this.getOrdinalSuffix(
        result.placement
      )} Place`;
      const color = result.isLocal ? [0, 150, 255] : [0, 0, 0];

      console.log(
        "Drawing result:",
        placementText,
        "at y:",
        y,
        "color:",
        color
      );
      this.p.fill(...color);
      this.p.noStroke(); // Remove stroke from text
      this.p.text(placementText, this.p.width / 2, y);
    });

    // Show remaining players if any
    const remainingPlayers = this.gameRenderer.actors.filter(
      actor => actor.type === "player" && !actor.finished
    ).length;

    if (remainingPlayers > 0) {
      this.p.fill(128);
      this.p.textSize(16);
      this.p.noStroke(); // Remove stroke from text
      this.p.text(
        `${remainingPlayers} player(s) still racing...`,
        this.p.width / 2,
        popupY + popupHeight - 80
      );
    }
  },

  getOrdinalSuffix: function (num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  },
  buttons: Object.values(buttons),
};

export default gameScene;
