//////////////////////////////////////////////////
// LIBRARIES & DEPENDENCIES                     //
//////////////////////////////////////////////////
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import config from "./config.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { dirname, join } from 'path';

// External Files
import PhysicsEngine from './src/physics/PhysicsEngine.js';
import GameState from './src/game/GameState.js';
import Database from './src/database/database.js';
import User from './src/database/user.js';

//////////////////////////////////////////////////
// Setup Email Management System                //
//////////////////////////////////////////////////
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: config.mail.host,
  port: config.mail.port,
  secure: true,
  auth: {
    user: config.mail.user,
    pass: config.mail.password
  },
});

async function sendVerificationEmail(email, verificationCode) {
  try {
    await transporter.sendMail({
      from: `"Paintball.io" <no-reply@paintball.io>`,
      to: email,
      subject: "Verify Your Account",
      html: `<p>Here is your verification code: ${verificationCode}</p>`
    }, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

//////////////////////////////////////////////////
// Globals                                      //
//////////////////////////////////////////////////
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


//////////////////////////////////////////////////
// Setup Express App                            //
//////////////////////////////////////////////////
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false  // No CORS in production as we serve static files
      : ['http://localhost:5173'], // Allow Vite dev server in development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

//////////////////////////////////////////////////
// Middleware                                   //
//////////////////////////////////////////////////

// cross-origin requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173'],
  credentials: true
}));

// json data
app.use(express.json());

// parse data passed through the URL
app.use(bodyParser.urlencoded({ extended: true }));


// Create session cookie
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1-day cookie
  })
);

// Set up passport for authentication
app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////////////////////
// Create Database Connection                   //
//////////////////////////////////////////////////
const db = new Database(config);

await db.test_connection();

console.log('Current NODE_ENV:', process.env.NODE_ENV);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  console.log('Serving static files from:', join(__dirname, '../client/dist'));
  app.use(express.static(join(__dirname, '../client/dist')));

  // Handle React routing in production
  app.get('*', (req, res) => {
    console.log('Serving index.html for route:', req.path);
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
} else {
  console.log('Running in development mode - static files not served');
}

//////////////////////////////////////////////////
// Game System                                  //
//////////////////////////////////////////////////
const physicsEngine = new PhysicsEngine();
const gameState = new GameState(physicsEngine);

// Physics update interval (60fps)
const PHYSICS_UPDATE_INTERVAL = 1000 / 60;

// Start physics update loop
setInterval(() => {
  gameState.processPhysics();
  io.emit('gameState', gameState.getState());
}, PHYSICS_UPDATE_INTERVAL);

//////////////////////////////////////////////////
// Socket.io Connection Handling                //
//////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle player joining
  socket.on('player:join', (data) => {
    // Try to reconnect using the stored playerId
    const playerId = data?.playerId;
    console.log('Player attempting to join with ID:', playerId);

    if (playerId && gameState.handleReconnect(socket.id, playerId)) {
      console.log(`Player ${playerId} reconnected successfully`);
      // Send the same player ID back to confirm reconnection
      socket.emit('playerId', playerId);
    } else {
      // If reconnection failed or not applicable, add as new player
      const player = gameState.addPlayer(socket.id);
      console.log(`New player joined with ID: ${player.playerId}`);
      // Send the player their persistent ID
      socket.emit('playerId', player.playerId);
    }
    io.emit('gameState', gameState.getState());
  });

  // Handle player input
  socket.on('playerInput', (input) => {
    gameState.updatePlayerInput(socket.id, input);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    gameState.handleDisconnect(socket.id);
    io.emit('gameState', gameState.getState());
  });
});

//////////////////////////////////////////////////
// RESTful API Routes                           //
//////////////////////////////////////////////////

// API routes can be added here
// Get personal-user data from authenticated user
app.get("/authenticated-user", (req, res) => {
  if (!req.isAuthenticated()) {
    res.json({
      user: null,
      error: "User not authenticated"
    });
  } else {
    const user = new User({
      username: req.user.username,
      email: req.user.email
    });

    res.json({
      user: user,
      error: null
    });
  }
});

// Get public-user data
app.get("/user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const rows = await db.get_verified_users({
      queryType: "username",
      filter: username,
      fields: ['username', 'email']
    });

    if (rows.length === 0) {
      res.json({
        error: "User not found"
      });
    } else {
      res.json({
        user: req.user,
        error: null
      });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.json({
      error: 'Internal Server Error'
    });
  }
});

// Handle Signup
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ error: "All fields are required", user: req.user });
  }

  try {
    const user = new User({ username: username, email: email, password: password });

    if (await user.is_username_unique(db)) {
      return res.json({ error: "Username already taken", user: req.user });
    } else if (await user.is_email_unique(db)) {
      return res.json({ error: "Email already taken", user: req.user });
    }

    await user.register(db, config.security.hashRounds, async function (verificationCode) {
      await sendVerificationEmail(email, verificationCode);

      return res.json({ message: "Signup successful! Please check your email for a verification code.", user: req.user });
    });

  } catch (error) {
    console.error("Error signing up user:", error.message);
    res.json({ error: "Internal server error", user: req.user });
  }
});

// Handle Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {

    if (!user) {
      if (err == "not_verified") {
        return res.json({ err_code: err, error: "User not verified. Request new verification email.", user: req.user, message: null });
      } else if (err == "user_not_found") {
        return res.json({ error: "No user found with that username.", user: req.user, message: null });
      } else if (err = "invalid_password") {
        return res.json({ error: "Incorrect password.", user: req.user, message: null });
      } else {
        // general case
        return res.json({ error: err, user: req.user, message: null });
      }
    }

    req.login(user, (err) => {
      if (err) {
        return res.json({ error: "Error logging in", user: req.user, message: null });
      } else {
        return res.json({ error: null, user: req.user, message: "Successful Login" });
      }
    });
  })(req, res, next);
});

// Handle Logout
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.json({ error: "Logout failed" });

    req.session.destroy(() => {
      return res.json({ message: "Logout successful." });
    });
  });
});

// verifies a registered user (unverified_users table --> users table)
app.post("/verify", async (req, res) => {
  const code = req.body.verificationCode;

  if (!code) {
    return res.render({ error: "Invalid verification code." });
  }

  try {
    await db.verify_user({ code: code }, (success) => {
      if (success) {
        res.json({ user: req.user, error: null, message: "Account verified! You can now login!" });
      } else {
        return res.json({ user: req.user, err_code: "invalid_code", error: "Invalid code.", message: null });
      }
    });

  } catch (error) {
    console.error("Error verifying user:", error.message);
    res.json({ error: "Internal server error." });
  }
});

// resend verification
app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {

    await db.resend_verification_email({ email: email }, async (success, verificationCode) => {
      if (success) {
        res.json({
          message: "A new verification email has been sent.",
          error: null,
          user: req.user
        });

        await sendVerificationEmail(email, verificationCode);
      } else {
        res.json({
          error: "No unverified account found with this email.",
          message: null,
          user: req.user
        });
      }
    });
  } catch (error) {
    console.error("Error resending verification email:", error.message);
    res.json({
      error: "Internal server error.",
      message: null,
      user: req.user
    });
  }
});

//////////////////////////////////////////////////
// Passport Authentication                      //
//////////////////////////////////////////////////
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const user = new User({ username: username, password: password });

      // Check if user is in unverified_users
      const unverifiedUsers = await user.match_unverified_users(db);

      if (unverifiedUsers.length > 0) {
        return cb("not_verified", false);
      }

      const users = await user.match_verified_users(db);

      if (users.length === 0) {
        return cb("user_not_found", false);
      }

      bcrypt.compare(password, users[0].password, (err, valid) => {
        if (valid) return cb(null, users[0]);
        return cb("invalid_password", false);
      });
    } catch (err) {
      return cb(err);
    }
  })
);

//////////////////////////////////////////////////
// Data Maintenance                             //
//////////////////////////////////////////////////
// Manage user sessions
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Deleted users from unverified_users table after 7 days
db.refresh_unverified_users();

//////////////////////////////////////////////////
// Run Server                                   //
//////////////////////////////////////////////////
server.listen(config.app.port, () => {
  console.log(`Server running on port ${config.app.port}`);
});