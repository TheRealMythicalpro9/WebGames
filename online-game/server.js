// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust for security in production (e.g., set to your domain)
        methods: ["GET", "POST"]
    }
});

// Store connected users
let users = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

// Serve the chat page
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Serve the player list page
app.get('/player-list', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player-list.html'));
});

// Set up Socket.IO event handling
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // When a user sets their username
    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
    });

    // When a chat message is sent
    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data);
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

// Start the server on Render's assigned port or default to 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
