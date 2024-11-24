const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected users
let users = {};

app.use(express.static("public"));

// Serve the homepage as the default page
app.get("/", (req, res) => {
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

  // Add user to the list
  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    io.emit("userList", Object.values(users)); // Update all clients
  });

  // Handle chat messages
  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data); // Broadcast the message
  });

  // Remove user when disconnected
  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
    delete users[socket.id];
    io.emit("userList", Object.values(users)); // Update all clients
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
