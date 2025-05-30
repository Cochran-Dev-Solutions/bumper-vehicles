import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

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

// Game state
const gameState = {
  players: {}
};

// Basic Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle player joining
  socket.on('player:join', (data) => {
    gameState.players[socket.id] = {
      id: socket.id,
      x: Math.random() * 700 + 50,  // Random position
      y: Math.random() * 500 + 50,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`  // Random color
    };

    // Broadcast updated game state to all clients
    io.emit('gameState', gameState);
  });

  // Handle player movement
  socket.on('player:move', (data) => {
    if (gameState.players[socket.id]) {
      // Update player position
      gameState.players[socket.id] = {
        ...gameState.players[socket.id],
        ...data
      };

      // Broadcast updated game state to all clients
      io.emit('gameState', gameState);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove player from game state
    delete gameState.players[socket.id];
    // Broadcast updated game state to all clients
    io.emit('gameState', gameState);
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