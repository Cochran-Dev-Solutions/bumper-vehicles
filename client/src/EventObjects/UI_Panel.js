class UI_Panel {
  static mode = {
    x: 'left',
    y: 'top'
  };

  static setMode(x_mode = 'left', y_mode = 'top') {
    UI_Panel.mode.x = x_mode;
    UI_Panel.mode.y = y_mode;
  }

  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || window.innerWidth;
    this.height = config.height || window.innerHeight;
    this.active = true;

    // defines (x,y) coordiantes with respect to panel
    this.x_mode = 'left';
    this.y_mode = 'top';

    this.layouts = config.layouts || { 0: () => { } };

    this.buttons = config.buttons || [];
  }



  X(x) {
    return (UI_Panel.mode.x === 'left') ? (this.x + x) : (this.x + this.width - x);
  }

  Y(y) {
    return (UI_Panel.mode.y === 'top') ? (this.y + y) : (this.y + this.height - y);
  }

  resizePanel(windowWidth, windowHeight) {

  }

  display() {
    // Find the appropriate layout breakpoint
    const breakpoints = Object.keys(this.layouts).map(Number).sort((a, b) => a - b);
    const currentWidth = window.innerWidth;

    // Find the largest breakpoint that's less than or equal to current width
    const activeBreakpoint = breakpoints.reduce((prev, curr) => {
      return (curr <= currentWidth && curr > prev) ? curr : prev;
    }, -1);

    // Call the layout function for the active breakpoint
    if (activeBreakpoint !== -1) {
      this.layouts[activeBreakpoint].call(this);
    }
  }
}

export default UI_Panel;