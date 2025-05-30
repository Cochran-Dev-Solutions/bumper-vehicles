import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import PhysicsEngine from './src/physics/PhysicsEngine.js';
import GameState from './src/game/GameState.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')));
}

// Initialize game systems
const physicsEngine = new PhysicsEngine();
const gameState = new GameState(physicsEngine);

// Physics update interval (60fps)
const PHYSICS_UPDATE_INTERVAL = 1000 / 60;

// Start physics update loop
setInterval(() => {
  gameState.processPhysics();
  io.emit('gameState', gameState.getState());
}, PHYSICS_UPDATE_INTERVAL);

// Basic Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle player joining
  socket.on('player:join', (data) => {
    gameState.addPlayer(socket.id);
    io.emit('gameState', gameState.getState());
  });

  // Handle player input
  socket.on('playerInput', (input) => {
    gameState.updatePlayerInput(socket.id, input);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    gameState.removePlayer(socket.id);
    io.emit('gameState', gameState.getState());
  });
});

// API routes can be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle React routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 