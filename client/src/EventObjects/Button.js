export default class Button {
  static types = {};

  static registerType(type, func) {
    Button.types[type] = func;
  }

  constructor(config) {
    this.display = config.display || function () { };
    this.onClick = config.onClick || function () { };
    this.x = config.x || null;
    this.y = config.y || null;
    this.width = config.width;
    this.height = config.height;

    // Extra args
    this.args = config.args || {};

    this.shape = config.shape || 'rect';
    this.side = config.side || 'left';
    this.theta = config.theta || 0;
  }

  // Assumes obj is a rectangle
  isInside(obj) {
    return Button.types[this.shape](obj, this);
  }

  handleClick(obj) {
    if (this.isInside(obj)) {
      this.onClick();
    }
  }

  update(x, y) {
    this.x = x ? x : this.x;
    this.y = y ? y : this.y;
    this.display();
  }
}