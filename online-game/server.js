const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const statsFile = "./visit-stats.json";

// Load and save visit stats
function loadVisitStats() {
  if (fs.existsSync(statsFile)) {
    const stats = JSON.parse(fs.readFileSync(statsFile, "utf-8"));
    // Ensure 'allTime' exists in older versions of the stats file
    if (!stats.allTime) stats.allTime = 0;
    return stats;
  }
  return { today: 0, week: 0, month: 0, allTime: 0, startDate: new Date().toISOString() };
}

function saveVisitStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), "utf-8");
}

let visitStats = loadVisitStats();
const users = {};

// Serve static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/homepage.html");
});

app.get("/chat.html", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

app.get("/player-list.html", (req, res) => {
  res.sendFile(__dirname + "/public/player-list.html");
});

// Increment visit stats
app.get("/add-visit", (req, res) => {
  const now = new Date();
  const startDate = new Date(visitStats.startDate);

  // Reset daily stats if the day has changed
  if (now.getDate() !== startDate.getDate()) {
    visitStats.today = 0;
    visitStats.startDate = now.toISOString();
  }

  // Increment all counters
  visitStats.today++;
  visitStats.week++;
  visitStats.month++;
  visitStats.allTime++; // Increment the all-time counter

  saveVisitStats(visitStats);

  res.json({ message: "Visit counted" });
});

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
    io.emit("chatMessage", message);
  });

  // Disconnect handling
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
