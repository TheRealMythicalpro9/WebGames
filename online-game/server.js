const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store visits (for simplicity, this is in-memory, but use a DB in a real app)
let visits = [];

// Helper function to get the number of visits within a certain time range
function getVisitCount(timeLimit) {
  const now = new Date();
  return visits.filter((visit) => now - new Date(visit.timestamp) <= timeLimit).length;
}

app.use(express.static("public"));

// Serve the homepage as the default page
app.get("/", (req, res) => {
  // Record the visit time
  visits.push({ timestamp: new Date() });
  res.sendFile(__dirname + "/public/homepage.html");
});

// Serve the chat page
app.get("/chat.html", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

// Serve the player list page
app.get("/player-list.html", (req, res) => {
  res.sendFile(__dirname + "/public/player-list.html");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Handle chat messages
  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data); // Broadcast the message
  });

  // Remove user when disconnected
  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
  });
});

// Endpoint to get visit statistics
app.get("/visit-stats", (req, res) => {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day
  const oneWeek = oneDay * 7; // Milliseconds in one week
  const oneMonth = oneDay * 30; // Milliseconds in one month

  res.json({
    today: getVisitCount(oneDay),
    week: getVisitCount(oneWeek),
    month: getVisitCount(oneMonth),
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
