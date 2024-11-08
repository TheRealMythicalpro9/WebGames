const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { spawn } = require('child_process'); // Import child_process module

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
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

    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
    });

    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

// Start the main server on Render's assigned port or default to 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Main server is running on port ${port}`);
});

// Define paths to the additional server.js files
const additionalServers = [
    './public/pong-online/server.js', // Replace with actual path
    './public/tic-tac-toe-online/server/index.js', // Replace with actual path
];

// Function to spawn each additional server process
function startAdditionalServer(serverPath) {
    const serverProcess = spawn('node', [serverPath], {
        stdio: 'inherit' // Passes the output of each process to the main console
    });

    serverProcess.on('error', (err) => {
        console.error(`Failed to start server at ${serverPath}:`, err);
    });

    serverProcess.on('exit', (code) => {
        console.log(`Server at ${serverPath} exited with code ${code}`);
    });
}

// Start each additional server
additionalServers.forEach(startAdditionalServer);
