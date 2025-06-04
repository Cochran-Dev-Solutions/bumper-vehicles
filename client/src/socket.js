import { io } from 'socket.io-client';

class Socket {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.handlers = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      // Connect to the server
      const serverUrl = import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
      console.log('Connecting to server at:', serverUrl);
      this.socket = io(serverUrl);

      this.socket.on('connect', () => {
        this.connected = true;
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        console.log('Disconnected from server');
      });

      // Set up error handling
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  // Method to emit events to the server
  emit(event, data) {
    if (!this.connected) {
      console.warn('Socket not connected. Cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Method to register event handlers
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
    this.socket.on(event, handler);
  }

  // Method to remove event handlers
  off(event, handler) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(handler);
      this.socket.off(event, handler);
    }
  }

  // Method to disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  // Getter for socket ID
  get id() {
    return this.socket?.id;
  }

  // Getter for connection status
  get isConnected() {
    return this.connected;
  }
}

// Create and export a singleton instance
const socket = new Socket();
export default socket; 