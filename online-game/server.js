const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Path to the stats file
const statsFile = "./visit-stats.json";

// Function to load visit stats from file
function loadVisitStats() {
  if (fs.existsSync(statsFile)) {
    return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
  }
  // If file doesn't exist, initialize stats
  return { today: 0, week: 0, month: 0, startDate: new Date().toISOString() };
}

// Function to save visit stats to file
function saveVisitStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), "utf-8");
}

// Initialize stats
let visitStats = loadVisitStats();

// Middleware to serve static files
app.use(express.static("public"));

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/homepage.html");
});

// Increment visit stats
app.get("/add-visit", (req, res) => {
  const now = new Date();
  const startDate = new Date(visitStats.startDate);

  // Reset stats if a new day starts
  if (now.getDate() !== startDate.getDate()) {
    visitStats.today = 0;
    visitStats.startDate = now.toISOString();
  }

  // Increment visits
  visitStats.today++;
  visitStats.week++;
  visitStats.month++;

  // Save stats to file
  saveVisitStats(visitStats);

  res.json({ message: "Visit counted" });
});

// Get visit stats
app.get("/visit-stats", (req, res) => {
  res.json(visitStats);
});

// Socket.IO logic (unchanged)
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("setUsername", (username) => {
    io.emit("userList", Object.values(users)); // Update all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
