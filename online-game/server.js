const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use persistent storage or local file
const statsFile = process.env.RENDER_PERSISTENT_STORAGE || path.join(__dirname, "visit-stats.json");

// Load and save visit stats
function loadVisitStats() {
  if (fs.existsSync(statsFile)) {
    return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
  }
  return { today: 0, week: 0, month: 0, allTime: 0, startDate: new Date().toISOString() };
}

function saveVisitStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), "utf-8");
}

// Reset stats based on the current date
function resetStatsIfNeeded() {
  const now = new Date();
  const statsDate = new Date(visitStats.startDate);

  // Reset daily stats
  if (now.toDateString() !== statsDate.toDateString()) {
    visitStats.today = 0;
    visitStats.startDate = now.toISOString();
  }

  // Reset weekly stats (e.g., every Sunday)
  if (now.getDay() === 0 && statsDate.getDay() !== 0) {
    visitStats.week = 0;
  }

  // Reset monthly stats
  if (now.getMonth() !== statsDate.getMonth() || now.getFullYear() !== statsDate.getFullYear()) {
    visitStats.month = 0;
  }
}

let visitStats = loadVisitStats();
const users = {};

// Middleware to serve static files
app.use(express.static("public"));

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homepage.html"));
});

// Additional pages for chat and player list
app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

app.get("/player-list.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "player-list.html"));
});

// API to increment visit stats
app.get("/add-visit", (req, res) => {
  resetStatsIfNeeded();

  // Update stats
  visitStats.today++;
  visitStats.week++;
  visitStats.month++;
  visitStats.allTime++;

  // Save stats to file
  saveVisitStats(visitStats);

  res.json({ message: "Visit counted", visitStats });
});

// API to fetch visit stats
app.get("/visit-stats", (req, res) => {
  res.json(visitStats);
});

// Socket.IO handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Assign default username
  users[socket.id] = { username: `Guest${socket.id.substring(0, 5)}` };
  io.emit("userList", Object.values(users));

  // Handle username updates
  socket.on("setUsername", (username) => {
    users[socket.id].username = username;
    io.emit("userList", Object.values(users));
  });

  // Broadcast chat messages
  socket.on("chatMessage", (message) => {
    io.emit("chatMessage", { username: users[socket.id]?.username || "Anonymous", message });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit("userList", Object.values(users));
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
