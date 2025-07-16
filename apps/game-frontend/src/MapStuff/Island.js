// Island.js
// Represents an island on the map scene

class Island {
  /**
   * @param {Object} options
   * @param {number} options.x - Center x position of the island
   * @param {number} options.y - Center y position of the island
   * @param {string} options.title - Title of the island
   * @param {Object} options.titleOffset - {x, y} offset for title relative to island center
   * @param {Object} options.stopOffset - {x, y} offset for stop position relative to island center
   * @param {p5.Image} options.image - The island image
   * @param {Function} options.panel_method - Custom method to draw island-specific content
   * @param {string} options.description - Description text for the island
   */
  constructor({
    x,
    y,
    title,
    titleOffset = { x: 0, y: -60 },
    stopOffset = { x: 0, y: 80 },
    image = null,
    panel_method = null,
    slug = "",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  }) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 200;
    this.title = title;
    this.slug = slug;
    this.titleOffset = titleOffset;
    this.stopOffset = stopOffset;
    this.image = image;
    this.panel_method = panel_method;
    this.description = description;

    this.isSelected = false;
  }

  // Get absolute position for the title
  getTitlePosition() {
    return {
      x: this.x + this.titleOffset.x,
      y: this.y + this.titleOffset.y,
    };
  }

  // Get absolute stop position for the character
  getStopPosition() {
    return {
      x: this.x + this.stopOffset.x,
      y: this.y + this.stopOffset.y,
    };
  }

  // Optionally, a draw method for the island
  draw(p, isPlayerAtIsland = false) {
    if (this.image) {
      p.image(
        this.image,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }
    // Only draw title when player is at this island
    if (isPlayerAtIsland && !this.isSelected) {
      const titlePos = this.getTitlePosition();

      // Draw transparent white background behind title
      p.fill(255, 255, 255, 180); // White with 70% opacity
      p.noStroke();
      p.textSize(24);
      p.textAlign(p.CENTER, p.BOTTOM);
      const textWidth = p.textWidth(this.title);
      const textHeight = 30; // Approximate text height
      p.rect(
        titlePos.x - textWidth / 2 - 10, // 10px padding on each side
        titlePos.y - textHeight - 5, // 5px padding on top
        textWidth + 20, // 20px total padding
        textHeight + 10 // 10px total padding
      );

      // Draw title text
      p.fill(0); // Black text
      p.text(this.title, titlePos.x, titlePos.y);
    }
  }

  select() {
    this.isSelected = true;
  }

  deselect() {
    this.isSelected = false;
  }

  // Generic method to display island panel when zoomed in
  displayPanel(p, camera) {
    const panelMargin = 50;
    const panelWidth = p.width / 2 - panelMargin * 2;
    const panelHeight = p.height - panelMargin * 2;
    const panelX = p.width - panelWidth - panelMargin;
    const panelY = panelMargin;

    // Draw grey background panel
    p.fill(100, 100, 100);
    p.noStroke();
    p.rect(panelX, panelY, panelWidth, panelHeight, 10);

    // Draw title
    p.fill(255);
    p.textSize(32);
    p.textAlign(p.LEFT, p.TOP);
    p.textStyle(p.BOLD);
    p.text(this.title, panelX + 20, panelY + 20);

    // Draw description
    p.textSize(16);
    p.textStyle(p.NORMAL);
    p.text(this.description, panelX + 20, panelY + 80, panelWidth - 40);

    // Call the custom panel method if it exists
    if (this.panel_method) {
      this.panel_method(p, panelX, panelY, panelWidth, panelHeight);
    }
  }
}

export default Island;
