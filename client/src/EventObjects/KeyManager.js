// client/src/EventObjects/KeyManager.js
import InputManager from "./InputManager.js";

class KeyManager extends InputManager {
  constructor() {
    /**
     **** InputManager contains:
     * this.events = []; --> sequentially recorded actions
     * this.current = {}; --> current/active events
    **/
    super();

    // registered actions
    this.actions = {};

    // key press callbacks
    this.keyPressCallbacks = new Map();
    
    // generic key press and release callbacks
    this.genericKeyPressCallbacks = [];
    this.genericKeyReleaseCallbacks = [];
  }

  // registers labeled actions: effectively associates a key code 
  // with a string such as "jump"
  register(action, keyCode) {
    this.actions[action] = keyCode;
  }

  // Get the action name for a given keyCode
  getActionForKeyCode(keyCode) {
    return Object.keys(this.actions).find(action => this.actions[action] === keyCode);
  }

  // Register a callback for when a key is pressed
  onKeyPress(key, callback) {
    this.keyPressCallbacks.set(key, callback);
  }

  // Register a generic callback for when any key is pressed
  onGenericKeyPress(callback) {
    this.genericKeyPressCallbacks.push(callback);
  }

  // Register a generic callback for when any key is released
  onGenericKeyRelease(callback) {
    this.genericKeyReleaseCallbacks.push(callback);
  }

  // checks if the 'selector' key is being pressed
  pressed(selector) {
    // if selector is string, then it is an action label, and we
    // should get the key code associated with the registration
    selector = (typeof selector === 'string') ? this.actions[selector] : selector;

    // if selector was action label AND it was not registered
    if (!selector) return false;

    return this.current[selector];
  }

  // activates a key
  keyPressed(keyCode) {
    this.current[keyCode] = true;

    // Check if there's a callback for this specific key
    const callback = this.keyPressCallbacks.get(keyCode);
    if (callback) {
      callback();
    }

    // Call all generic key press callbacks
    this.genericKeyPressCallbacks.forEach(callback => callback(keyCode));
  }

  // deactivates a key
  keyReleased(keyCode) {
    if (this.current[keyCode]) {
      delete this.current[keyCode];
      
      // Call all generic key release callbacks
      this.genericKeyReleaseCallbacks.forEach(callback => callback(keyCode));
    }
  }
}

// Create and export a singleton instance
const keyManager = new KeyManager();
export default keyManager; 